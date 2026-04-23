<?php

$config = require __DIR__ . '/config.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $dbPath = __DIR__ . '/../data/wiki.sqlite';
    $init = !file_exists($dbPath);
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($init) {
        initialize_db($pdo);
        seed_db($pdo);
    }

    return $pdo;
}

function initialize_db(PDO $pdo): void {
    $pdo->exec('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password_hash TEXT, role TEXT, reset_token TEXT, avatar_path TEXT)');
    $pdo->exec('CREATE TABLE notes (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER, title TEXT, body TEXT, created_at TEXT)');
}

function seed_db(PDO $pdo): void {
    $adminHash = password_hash('admin123!', PASSWORD_DEFAULT);
    $userHash = password_hash('user123!', PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users(email,password_hash,role,reset_token,avatar_path) VALUES(?,?,?,?,?)');
    $stmt->execute(['admin@lab.local', $adminHash, 'admin', '', '']);
    $stmt->execute(['user@lab.local', $userHash, 'user', '', '']);

    $pdo->exec("INSERT INTO notes(owner_id,title,body,created_at) VALUES(1,'Seed Admin Note','admin seed note',datetime('now'))");
    $pdo->exec("INSERT INTO notes(owner_id,title,body,created_at) VALUES(2,'Seed User Note','user seed note',datetime('now'))");
}

function current_user(): ?array {
    if (empty($_SESSION['uid'])) return null;
    $stmt = db()->prepare('SELECT id,email,role,avatar_path FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['uid']]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);
    return $u ?: null;
}

function require_auth(): array {
    $u = current_user();
    if (!$u) {
        header('Location: /?r=login');
        exit;
    }
    return $u;
}

function require_admin(): array {
    $u = require_auth();
    if (($u['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo 'admin only';
        exit;
    }
    return $u;
}

function render_template(string $name, array $data = []): void {
    extract($data);
    require __DIR__ . '/../templates/' . $name . '.php';
}
