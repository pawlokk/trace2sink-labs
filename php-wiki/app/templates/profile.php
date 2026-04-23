<!doctype html><html><body>
<h2>Profile</h2>
<p><?= htmlspecialchars($user['email']) ?> (<?= htmlspecialchars($user['role']) ?>)</p>
<?php if (!empty($user['avatar_path'])): ?><p>avatar path: <?= htmlspecialchars($user['avatar_path']) ?></p><?php endif; ?>
<form method='post' enctype='multipart/form-data'>
<input type='file' name='avatar'>
<input name='path' placeholder='training hook path override'>
<button>upload avatar</button>
</form>
<a href='/?r=home'>home</a>
</body></html>
