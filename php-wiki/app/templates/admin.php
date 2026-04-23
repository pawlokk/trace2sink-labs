<!doctype html><html><body>
<h2>Admin dashboard</h2>
<table border='1'><tr><th>id</th><th>email</th><th>role</th><th>avatar</th><th>reset_token</th></tr>
<?php foreach ($users as $u): ?>
<tr><td><?= (int)$u['id'] ?></td><td><?= htmlspecialchars($u['email']) ?></td><td><?= htmlspecialchars($u['role']) ?></td><td><?= htmlspecialchars($u['avatar_path']) ?></td><td><?= htmlspecialchars($u['reset_token']) ?></td></tr>
<?php endforeach; ?>
</table>
<a href='/?r=home'>home</a>
</body></html>
