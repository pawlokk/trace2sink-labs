<?php
require __DIR__ . '/../src/bootstrap.php';

$route = $_GET['r'] ?? 'home';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$cfg = $config;

// ENTRYPOINT: router accepts user-controlled route key from query param.
switch ($route) {
    case 'home':
        $u = current_user();
        render_template('home', ['user' => $u]);
        break;

    case 'register':
        if ($method === 'POST') {
            $email = $_POST['email'] ?? '';
            $pass = $_POST['password'] ?? '';
            $stmt = db()->prepare('INSERT INTO users(email,password_hash,role,reset_token,avatar_path) VALUES(?,?,?,?,?)');
            $stmt->execute([$email, password_hash($pass, PASSWORD_DEFAULT), 'user', '', '']);
            header('Location: /?r=login');
            exit;
        }
        render_template('register');
        break;

    case 'login':
        if ($method === 'POST') {
            $email = $_POST['email'] ?? '';
            $pass = $_POST['password'] ?? '';
            $stmt = db()->prepare('SELECT id,password_hash FROM users WHERE email=?');
            $stmt->execute([$email]);
            $u = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($u && password_verify($pass, $u['password_hash'])) {
                $_SESSION['uid'] = (int)$u['id'];
                header('Location: /?r=notes');
                exit;
            }
        }
        render_template('login');
        break;

    case 'logout':
        session_destroy();
        header('Location: /');
        break;

    case 'request_reset':
        if ($method === 'POST') {
            $email = $_POST['email'] ?? '';
            $token = bin2hex(random_bytes(6));
            $stmt = db()->prepare('UPDATE users SET reset_token=? WHERE email=?');
            $stmt->execute([$token, $email]);
            render_template('reset_requested', ['token' => $token]);
            break;
        }
        render_template('request_reset');
        break;

    case 'reset':
        if ($method === 'POST') {
            $email = $_POST['email'] ?? '';
            $token = $_POST['token'] ?? '';
            $newPass = $_POST['password'] ?? '';
            $stmt = db()->prepare('SELECT id,reset_token FROM users WHERE email=?');
            $stmt->execute([$email]);
            $u = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($u) {
                $ok = false;
                if ($cfg['toggles']['unsafe_reset_compare']) {
                    // TRAINING HOOK (UNSAFE): weak token check.
                    $ok = ($u['reset_token'] == $token);
                } else {
                    $ok = hash_equals((string)$u['reset_token'], (string)$token);
                }
                if ($ok) {
                    $up = db()->prepare('UPDATE users SET password_hash=?, reset_token=? WHERE id=?');
                    $up->execute([password_hash($newPass, PASSWORD_DEFAULT), '', (int)$u['id']]);
                }
            }
            header('Location: /?r=login');
            exit;
        }
        render_template('reset');
        break;

    case 'profile':
        $u = require_auth();
        if ($method === 'POST' && isset($_FILES['avatar'])) {
            $name = basename($_FILES['avatar']['name'] ?? '');
            if ($cfg['toggles']['unsafe_avatar_path']) {
                // TRAINING HOOK (UNSAFE): path trust.
                $target = __DIR__ . '/../uploads/' . ($_POST['path'] ?? $name);
            } else {
                $target = __DIR__ . '/../uploads/' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $name);
            }
            move_uploaded_file($_FILES['avatar']['tmp_name'], $target);
            $rel = str_replace(__DIR__ . '/../', '', $target);
            $up = db()->prepare('UPDATE users SET avatar_path=? WHERE id=?');
            $up->execute([$rel, (int)$u['id']]);
            header('Location: /?r=profile');
            exit;
        }
        render_template('profile', ['user' => current_user()]);
        break;

    case 'notes':
        $u = require_auth();
        if ($method === 'POST') {
            $stmt = db()->prepare('INSERT INTO notes(owner_id,title,body,created_at) VALUES(?,?,?,datetime("now"))');
            $stmt->execute([(int)$u['id'], $_POST['title'] ?? '', $_POST['body'] ?? '']);
            header('Location: /?r=notes');
            exit;
        }

        $search = $_GET['q'] ?? '';
        if ($cfg['toggles']['unsafe_sql_search'] && $search !== '') {
            // TRAINING HOOK (UNSAFE): raw SQL with user input.
            $sql = "SELECT * FROM notes WHERE owner_id = " . (int)$u['id'] . " AND title LIKE '%" . $search . "%' ORDER BY id DESC";
            $rows = db()->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $stmt = db()->prepare('SELECT * FROM notes WHERE owner_id=? AND title LIKE ? ORDER BY id DESC');
            $stmt->execute([(int)$u['id'], '%' . $search . '%']);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        render_template('notes', ['notes' => $rows, 'query' => $search]);
        break;

    case 'note_view':
        $u = require_auth();
        $id = (int)($_GET['id'] ?? 0);
        $stmt = db()->prepare('SELECT * FROM notes WHERE id=?');
        $stmt->execute([$id]);
        $note = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$note) {
            http_response_code(404);
            echo 'not found';
            break;
        }
        // OWNERSHIP CHECK: owner or admin.
        if ((int)$note['owner_id'] !== (int)$u['id'] && $u['role'] !== 'admin') {
            http_response_code(403);
            echo 'forbidden';
            break;
        }
        render_template('note_view', ['note' => $note, 'unsafeRender' => $cfg['toggles']['unsafe_template_render']]);
        break;

    case 'admin':
        $u = require_admin();
        $rows = db()->query('SELECT id,email,role,avatar_path,reset_token FROM users ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
        render_template('admin', ['users' => $rows, 'user' => $u]);
        break;

    case 'api_notes':
        header('Content-Type: application/json');
        $u = require_auth();
        $stmt = db()->prepare('SELECT id,title,created_at FROM notes WHERE owner_id=? ORDER BY id DESC');
        $stmt->execute([(int)$u['id']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_SLASHES);
        break;

    default:
        http_response_code(404);
        echo 'not found';
}
