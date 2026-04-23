```
#note_repo.php → create_note

$stmt = db()->prepare('INSERT INTO notes (user_id, title, body, created_at, updated_at) VALUES (:user_id, :title, :body, :created_at, :updated_at)');

$now = gmdate('c');

$stmt->execute([
':user_id' => $userId,
':title' => $title,
':body' => $body,
':created_at' => $now,
':updated_at' => $now,
]);
```

```
#note_repo.php → update_note

$stmt = db()->prepare('UPDATE notes SET title = :title, body = :body, updated_at = :updated_at WHERE id = :id');

$stmt->execute([
':title' => $title,
':body' => $body,
':updated_at' => gmdate('c'),
':id' => $noteId,
]);

```

```
#note_repo.php →  
```