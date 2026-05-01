# blackbox recon
- full UI walkthrough with burp
- map frontend endpoints, parameters, roles
- success criteria:
	- [ ] complete burp sitemap
	- [ ] knowledge of every major user flow
```
# app func overview:

/auth:
register
login
logout
password reset

/profile:
get profile
edit profile

/posts:
adding posts
getting posts
get a post
patching a post
deleting a post

/imports:
upload 

/admin:
admin dashboard

/api/summary:
get summary of posts or imports

/health:
app health
```
# architecture mindmap
- full route table 
- config files
- middleware/wrappers
- models/DB layer
- mental mindmap of codebase
- success criteria:
	- [ ] `request → handler → logic → sink` flow 
	- [ ] knowledge of the exact places that control routing, auth, DB, rendering
```
# architecture overview:

ROUTES:
GET /health

POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/request-reset
POST /auth/reset

GET /profile
PATCH /profile

POST /posts
GET /posts
GET /posts/:post_id
PATCH /posts/:post_id
DELETE /posts/:post_id

POST /imports/upload

GET /admin

GET /api/summary

MIDDLEWARE:
sensitive paths are marked with a decorator of:
@require_auth, or
@require_admin

this logic is realized via the main.py logic and two separate functions
the rest of the options are DB CRUD operations which will be reviewed ltr
other than that there's templating in the admin dashboard func
```
# all sources mapping
- find all user inputs in code
- trace to the sink 
- note down transformations
- identify trust boundaries
- success criteria:
	- [ ] every user-controlled source is listed with context and notes
	- [ ] all possible inputs are accounted for (params, cookies, headers, files, session-derived state)
```
# all sources list:

request parameters
---
- GET params
  @app.get("/posts/<int:post_id>")
  q in GET /posts?q=
- POST params
  email,password in POST /auth/register||login
  email in POST /auth/request-reset
  email,token,newpassword in POST /auth/reset
  file in POST /imports/upload
  title,body in POST /posts
- PATCH params
  bio in PATCH /profile
  title,body,status in PATCH /posts/:post_id
- DELETE params
  post_id in DELETE /posts/:post_id


cookies
---
- user-set cookies
- auth/session cookies (user-controlled entry into session state)

headers
---
- Host
- Origin
- Referer
- Content-Type
- X-Forwarded-* / proxy headers
- custom headers

files / uploads
---
- filename
- tmp path
- MIME type
- size
- error codes
- file content

server/environment
---
- REQUEST_METHOD
- request URI/path
- server variables used in logic
- environment variables (if influenced externally)

session / state (trust-derived input)
---
- $_SESSION / session object
- auth principal / user context
- role / permissions stored in session
- cached user data

routing / dispatch
---
- route parameter (e.g. r, path, controller name)
- method-based routing (GET/POST branching)
- dynamic controller/action resolution

external input surfaces
---
- data from databases (stored user input)
- data from APIs / external services
- data from message queues / jobs
- imported files (CSV, XML, JSON, etc.)

content negotiation / protocol
---
- content-type switching
- format parameters (json/xml/debug/raw)
- accept headers influencing response/logic

client-side supplied state
---
- hidden form fields
- serialized objects in requests
- client-controlled flags (debug, admin, role, etc.)
```
# all sinks mapping 
- find all data sinks 
- trace back to user input 
- confirm controllability → break safety assumptions
- partial control vs full control check 
- note down transformations/filters1 i
- "can i reach this sink without intended flow?"
- success criteria:
	- [ ] every sink is mapped to at least one source
	- [ ] every value that reaches each sink is enumerated for control
```
# all sinks list:

database
---
/auth/register
exists = conn.execute(text("SELECT id FROM users WHERE email=:e"), {"e": email}).first()

conn.execute(text("INSERT INTO users(email,password_hash,role,bio) VALUES(:e,:p,'user','')"),
{"e": email, "p": generate_password_hash(password)})

/auth/login
row = conn.execute(text("SELECT id,password_hash FROM users WHERE email=:e"), {"e": email}).mappings().first()

/auth/request-reset
conn.execute(text("UPDATE users SET reset_token=:t WHERE email=:e"), {"t": token, "e": email})

/auth/reset
row = conn.execute(text("SELECT id,reset_token FROM users WHERE email=:e"), {"e": email}).mappings().first()
conn.execute(text("UPDATE users SET password_hash=:p, reset_token='' WHERE id=:id"),

{"p": generate_password_hash(new_password), "id": row["id"]})

/profile
conn.execute(text("UPDATE users SET bio=:b WHERE id=:id"), {"b": bio, "id": request.user["id"]})

/posts
conn.execute(text("INSERT INTO posts(owner_id,title,body,status) VALUES(:o,:t,:b,'open')"),
{"o": request.user["id"], "t": title, "b": body})

rows = conn.execute(text(
f"SELECT id,title,body,status,owner_id,created_at FROM posts WHERE title LIKE '%{q}%' ORDER BY id DESC"
)).mappings().all()

row = conn.execute(text("SELECT id,title,body,status,owner_id,created_at FROM posts WHERE id=:id"),
{"id": post_id}).mappings().first()

row = conn.execute(text("SELECT id,owner_id FROM posts WHERE id=:id"), {"id": post_id}).mappings().first()

conn.execute(text("UPDATE posts SET title=:t, body=:b, status=:s WHERE id=:id"), {
"t": str(data.get("title", "")),
"b": str(data.get("body", "")),
"s": str(data.get("status", "open")),
"id": post_id,
})

row = conn.execute(text("SELECT id,owner_id FROM posts WHERE id=:id"), {"id": post_id}).mappings().first()

conn.execute(text("DELETE FROM posts WHERE id=:id"), {"id": post_id})

/imports/upload
conn.execute(text("INSERT INTO imports(owner_id,filename,content) VALUES(:o,:f,:c)"), {
"o": request.user["id"],
"f": save_name,
"c": content,
})


file operations
---
def upload_import():
# FILE IMPORT ENTRYPINT: user-controlled file and metadata.
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

rendering / templating
---
# Jinja render entry point, with optional unsafe template rendering branch.

if TOGGLES["unsafe_template_render"]:

return render_template("admin_unsafe.html", imports=imports, posts=posts, user=request.user)

return render_template("admin_safe.html", imports=imports, posts=posts, user=request.user)

authentication / session handling
---
listed in the db ops 

authorization / access control
---
done by querying DB rows 
if row["owner_id"] != request.user["id"] and request.user["role"] != "admin":


application logic / state change
---
deleting or editing posts all described in DB sinks

data reuse / second-order sinks
---
rendering described in the templating section
```
# identifying data flows
- intake blackbox functionalities and create data flow diagrams 
- use the identified sources and match to identified sinks
- verify the other way - look at sinks, trace back to sources
- create a complete map of sinks ↔ sources
- success criteria:
	- [ ] at least one complete flow per major feature
	- [ ] each flow is tracable forward and backwards cleanly
```
# functionality to data flow chains:
# GET /search?q= SQL injection with required_auth()

GET 
↓
@require_auth → uses the current_user() function to determine auth level
↓
current_user() looks for the "uid" value in the session object
↓
if all goes well (the user has a valid default flask session cookie)
↓
and the app is able to extract a "uid" value from it
↓
you get to search for posts via the `q` parameter
↓
SELECT id,title,body,status,owner_id,created_at FROM posts WHERE title LIKE '%{q}%' ORDER BY id DESC
↓
this is the exact query
↓
here the q parameter is input right into the query without any safeguards
```
# high value areas review
- review auth and access control:
	- register, login, logout, pass reset, e-mail change, etc.
	- ownership checks 
	- state changes, roles
	- IDOR limitations
	- server-side enforcements
- state and logic flaws
	- enumerate workflows
	- break assumptions 
	- skip steps 
- deserialization
	- enumerate parsing points
	- identify libraries and versions
	- check unsafe usage 
- templates and rendering
	- enumerate templates usage
	- enumerate entry points
	- verify context injection possibiltes and escapes
- database interaction
	- raw queries vs ORM
	- concatenation vs parameterization
	- second-order injection potential
- file handling
	- uploads, downloads, includes
	- path construction logic
	- storage safety
	- storage vs exec paths
- config and secrets
	- enumerate secrets, keys, tokens
	- debug flags, dev modes
	- internal endpoints 
- framework specific pitfalls
	- loose comparisons
	- parser confusion
	- default unsafe configs
	- exact version vulns
- second order vulns
	- stored input → later execution
	- DB → template → exec chains
	- "where is this executed later?" → admin panel, jobs, templates, exports/imports
- dead features / rarely used code” pass
	- debug endpoints
	- admin helpers
	- maintenance scripts
	- “temporary” code
- success criteria:
	- [ ] every high-value area has been explicitly reviewed
	- [ ] shortlist of likely vuln candidates or broken trust boundary
```
# high value areas and the specific data flow chain:
# auth and access control
seemingly bulletproof

# state and logic flaws
good object level checks with a vulnerable branch, inconsistencies with decorators vs local checks

# templates and rendering
potentially vulnerable templating in admin dashboard with user supplied content lands as a string in a template 

# database interaction
mainly manual queries with some being vulnerable - good to exploit

# file handling
yes, all in one chain with rendering

# second order vulns
as above

# config and secrets
hardcoded admin credentials 
```
# exploitation and documentation
- use the created map for a clean path to victory
	- clean python scripts
	- no manual steps 
	- full chain 
- document everything
	- vulnerable code
	- data flow explanation
	- why is this vulnerable
	- lessons learned, mitigations
```
# exploitation plan

# create an account

# privilege escalation via the debug endpoint

# post an import with flask rce payload

# visit the admin page so the code renders 

# catch shell
```