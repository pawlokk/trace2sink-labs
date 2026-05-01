import os
import json
import secrets
from functools import wraps
from flask import Flask, request, session, jsonify, render_template, redirect, render_template_string
from sqlalchemy import create_engine, text
from werkzeug.security import generate_password_hash, check_password_hash

APP_PORT = int(os.getenv("APP_PORT", "5003"))
DEBUG_PORT = int(os.getenv("DEBUG_PORT", "5678"))
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-training-only")
DB_PATH = os.getenv("DATABASE_PATH", "/app/data/app.db")

TOGGLES = {
    "unsafe_raw_search": os.getenv("UNSAFE_RAW_SEARCH", "0") == "1",
    "unsafe_template_render": os.getenv("UNSAFE_TEMPLATE_RENDER", "0") == "1",
    "unsafe_import_path": os.getenv("UNSAFE_IMPORT_PATH", "0") == "1",
    "unsafe_reset_compare": os.getenv("UNSAFE_RESET_COMPARE", "0") == "1",
    "unsafe_owner_bypass": os.getenv("UNSAFE_OWNER_BYPASS", "0") == "1",
    "unsafe_role_update_sim": os.getenv("UNSAFE_ROLE_UPDATE_SIM", "0") == "1",
}

app = Flask(__name__, template_folder="templates")
app.secret_key = SECRET_KEY

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
os.makedirs("/app/app/uploads", exist_ok=True)
os.makedirs("/app/app/imports", exist_ok=True)

engine = create_engine(f"sqlite:///{DB_PATH}", future=True)


def init_db():
    with engine.begin() as conn:
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          reset_token TEXT DEFAULT '',
          bio TEXT DEFAULT ''
        )"""))
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS posts(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"""))
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS imports(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_id INTEGER,
          filename TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"""))


def seed_db():
    with engine.begin() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar_one()
        if count == 0:
            conn.execute(text("INSERT INTO users(email,password_hash,role,bio) VALUES(:e,:p,'admin','lab admin')"),
                         {"e": "admin@lab.local", "p": generate_password_hash("admin123!")})
            conn.execute(text("INSERT INTO users(email,password_hash,role,bio) VALUES(:e,:p,'user','content writer')"),
                         {"e": "alice@lab.local", "p": generate_password_hash("alice123!")})
            conn.execute(text("INSERT INTO posts(owner_id,title,body,status) VALUES(2,'Seed Ticket','initial seeded ticket','open')"))


def current_user():
    uid = session.get("uid")
    if not uid:
        return None
    with engine.begin() as conn:
        row = conn.execute(text("SELECT id,email,role,bio FROM users WHERE id=:id"), {"id": uid}).mappings().first()
        return dict(row) if row else None


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # AUTH TRUST BOUNDARY: session cookie -> authenticated user context.
        user = current_user()
        if not user:
            return jsonify({"error": "auth required"}), 401
        request.user = user
        return fn(*args, **kwargs)
    return wrapper


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            return jsonify({"error": "auth required"}), 401
        if user["role"] != "admin":
            return jsonify({"error": "admin only"}), 403
        request.user = user
        return fn(*args, **kwargs)
    return wrapper


@app.get("/health")
def health():
    # ENTRYPOINT trace start for remote checks.
    return jsonify({"ok": True, "app": "flask-ticket-blog"})


@app.post("/auth/register")
def register():
    data = request.get_json(force=True)
    email = str(data.get("email", ""))
    password = str(data.get("password", ""))
    if not email or not password:
        return jsonify({"error": "missing fields"}), 400
    with engine.begin() as conn:
        exists = conn.execute(text("SELECT id FROM users WHERE email=:e"), {"e": email}).first()
        if exists:
            return jsonify({"error": "already exists"}), 409
        conn.execute(text("INSERT INTO users(email,password_hash,role,bio) VALUES(:e,:p,'user','')"),
                     {"e": email, "p": generate_password_hash(password)})
    return jsonify({"message": "registered"})


@app.post("/auth/login")
def login():
    data = request.get_json(force=True)
    email = str(data.get("email", ""))
    password = str(data.get("password", ""))
    with engine.begin() as conn:
        row = conn.execute(text("SELECT id,password_hash FROM users WHERE email=:e"), {"e": email}).mappings().first()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "invalid credentials"}), 401
    session["uid"] = row["id"]
    return jsonify({"message": "logged in"})


@app.post("/auth/logout")
def logout():
    session.clear()
    return jsonify({"message": "logged out"})


@app.post("/auth/request-reset")
def request_reset():
    data = request.get_json(force=True)
    email = str(data.get("email", ""))
    token = secrets.token_hex(6)
    with engine.begin() as conn:
        conn.execute(text("UPDATE users SET reset_token=:t WHERE email=:e"), {"t": token, "e": email})
    return jsonify({"message": "token generated", "token": token})


@app.post("/auth/reset")
def reset_password():
    data = request.get_json(force=True)
    email = str(data.get("email", ""))
    token = str(data.get("token", ""))
    new_password = str(data.get("newPassword", ""))
    with engine.begin() as conn:
        row = conn.execute(text("SELECT id,reset_token FROM users WHERE email=:e"), {"e": email}).mappings().first()
        if not row:
            return jsonify({"error": "user not found"}), 404

        if TOGGLES["unsafe_reset_compare"]:
            ok = row["reset_token"] == token
        else:
            ok = secrets.compare_digest(str(row["reset_token"]), token)

        if not ok:
            return jsonify({"error": "bad token"}), 403

        conn.execute(text("UPDATE users SET password_hash=:p, reset_token='' WHERE id=:id"),
                     {"p": generate_password_hash(new_password), "id": row["id"]})
    return jsonify({"message": "password reset"})


@app.get("/profile")
@require_auth
def get_profile():
    return jsonify(request.user)


@app.patch("/profile")
@require_auth
def patch_profile():
    data = request.get_json(force=True)
    bio = str(data.get("bio", ""))
    with engine.begin() as conn:
        conn.execute(text("UPDATE users SET bio=:b WHERE id=:id"), {"b": bio, "id": request.user["id"]})
    return jsonify({"message": "profile updated"})


@app.post("/posts")
@require_auth
def create_post():
    data = request.get_json(force=True)
    title = str(data.get("title", ""))
    body = str(data.get("body", ""))
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO posts(owner_id,title,body,status) VALUES(:o,:t,:b,'open')"),
                     {"o": request.user["id"], "t": title, "b": body})
    return jsonify({"message": "created"}), 201


@app.get("/posts")
@require_auth
def list_posts():
    q = request.args.get("q", "")
    # USER INPUT -> QUERY construction trace point.
    with engine.begin() as conn:
        if TOGGLES["unsafe_raw_search"] and q:
            # TRAINING HOOK (UNSAFE): raw SQL-like query composition.
            rows = conn.execute(text(
                f"SELECT id,title,body,status,owner_id,created_at FROM posts WHERE title LIKE '%{q}%' ORDER BY id DESC"
            )).mappings().all()
        else:
            rows = conn.execute(
                text("SELECT id,title,body,status,owner_id,created_at FROM posts WHERE title LIKE :q ORDER BY id DESC"),
                {"q": f"%{q}%"}
            ).mappings().all()
    return jsonify([dict(r) for r in rows])


@app.get("/posts/<int:post_id>")
@require_auth
def get_post(post_id: int):
    with engine.begin() as conn:
        row = conn.execute(text("SELECT id,title,body,status,owner_id,created_at FROM posts WHERE id=:id"),
                           {"id": post_id}).mappings().first()
    if not row:
        return jsonify({"error": "not found"}), 404

    # OBJECT OWNERSHIP CHECK (toggleable unsafe bypass).
    if not TOGGLES["unsafe_owner_bypass"]:
        if row["owner_id"] != request.user["id"] and request.user["role"] != "admin":
            return jsonify({"error": "forbidden"}), 403

    return jsonify(dict(row))


@app.patch("/posts/<int:post_id>")
@require_auth
def patch_post(post_id: int):
    data = request.get_json(force=True)
    with engine.begin() as conn:
        row = conn.execute(text("SELECT id,owner_id FROM posts WHERE id=:id"), {"id": post_id}).mappings().first()
        if not row:
            return jsonify({"error": "not found"}), 404
        if row["owner_id"] != request.user["id"] and request.user["role"] != "admin":
            return jsonify({"error": "forbidden"}), 403
        conn.execute(text("UPDATE posts SET title=:t, body=:b, status=:s WHERE id=:id"), {
            "t": str(data.get("title", "")),
            "b": str(data.get("body", "")),
            "s": str(data.get("status", "open")),
            "id": post_id,
        })
    return jsonify({"message": "updated"})


@app.delete("/posts/<int:post_id>")
@require_auth
def delete_post(post_id: int):
    with engine.begin() as conn:
        row = conn.execute(text("SELECT id,owner_id FROM posts WHERE id=:id"), {"id": post_id}).mappings().first()
        if not row:
            return jsonify({"error": "not found"}), 404
        if row["owner_id"] != request.user["id"] and request.user["role"] != "admin":
            return jsonify({"error": "forbidden"}), 403
        conn.execute(text("DELETE FROM posts WHERE id=:id"), {"id": post_id})
    return jsonify({"message": "deleted"})


@app.post("/imports/upload")
@require_admin
def upload_import():
    # FILE IMPORT ENTRYPOINT: user-controlled file and metadata.
    if "file" not in request.files:
        return jsonify({"error": "file required"}), 400
    file = request.files["file"]
    filename = file.filename or "import.txt"

    if TOGGLES["unsafe_import_path"]:
        save_name = request.form.get("path", filename)
    else:
        save_name = "".join(ch for ch in filename if ch.isalnum() or ch in "._-")

    full_path = os.path.join("/app/app/imports", save_name)
    file.save(full_path)

    content = open(full_path, "r", encoding="utf-8", errors="ignore").read(5000)
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO imports(owner_id,filename,content) VALUES(:o,:f,:c)"), {
            "o": request.user["id"],
            "f": save_name,
            "c": content,
        })
    return jsonify({"message": "import stored", "filename": save_name})


@app.get("/admin")
@require_admin
def admin_dashboard():
    with engine.begin() as conn:
        imports = conn.execute(text("SELECT id,filename,content,created_at FROM imports ORDER BY id DESC LIMIT 30")).mappings().all()
        posts = conn.execute(text("SELECT id,title,body,status,owner_id FROM posts ORDER BY id DESC LIMIT 30")).mappings().all()

    # Jinja render entry point, with optional unsafe template rendering branch.
    if TOGGLES["unsafe_template_render"]:
        for row in imports:
            return render_template_string(row["content"])
    return render_template("admin_safe.html", imports=imports, posts=posts, user=request.user)


@app.get("/api/summary")
@require_auth
def api_summary():
    with engine.begin() as conn:
        posts_count = conn.execute(text("SELECT COUNT(*) FROM posts")).scalar_one()
        imports_count = conn.execute(text("SELECT COUNT(*) FROM imports")).scalar_one()
    return jsonify({"posts": posts_count, "imports": imports_count})


@app.post("/api/debug/role-update")
@require_auth
def debug_role_update_sim():
    # TRAINING HOOK (SIMULATION): intentionally weak trust boundary for role updates.
    # This is not exploit-grade SQL behavior; it is a controlled app-logic anti-pattern.
    if not TOGGLES["unsafe_role_update_sim"]:
        return jsonify({"error": "simulation disabled"}), 403

    data = request.get_json(force=True)
    target_email = str(data.get("email", ""))
    new_role = str(data.get("role", "user"))

    if new_role not in ("user", "admin"):
        return jsonify({"error": "invalid role"}), 400

    with engine.begin() as conn:
        # No admin check on purpose when toggle is enabled.
        row = conn.execute(
            text("SELECT id,email,role FROM users WHERE email=:e"),
            {"e": target_email}
        ).mappings().first()
        if not row:
            return jsonify({"error": "target not found"}), 404
        conn.execute(
            text("UPDATE users SET role=:r WHERE id=:id"),
            {"r": new_role, "id": row["id"]}
        )
    return jsonify({
        "message": "simulation role updated",
        "target": target_email,
        "newRole": new_role,
        "byUser": request.user["email"]
    })


def start_debugpy_if_needed():
    if os.getenv("ENABLE_DEBUGPY", "1") == "1":
        import debugpy
        debugpy.listen(("0.0.0.0", DEBUG_PORT))
        print(f"[debug] debugpy listening on {DEBUG_PORT}")


if __name__ == "__main__":
    init_db()
    seed_db()
    start_debugpy_if_needed()
    print(f"[app] flask-ticket-blog listening on {APP_PORT}")
    app.run(host="0.0.0.0", port=APP_PORT, debug=False)
