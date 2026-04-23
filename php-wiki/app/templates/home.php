<!doctype html><html><body>
<h1>PHP Wiki Lab</h1>
<?php if ($user): ?>
<p>Logged in as <?= htmlspecialchars($user['email']) ?> (<?= htmlspecialchars($user['role']) ?>)</p>
<a href='/?r=notes'>notes</a> | <a href='/?r=profile'>profile</a> | <a href='/?r=api_notes'>api</a> | <a href='/?r=admin'>admin</a> | <a href='/?r=logout'>logout</a>
<?php else: ?>
<a href='/?r=login'>login</a> | <a href='/?r=register'>register</a> | <a href='/?r=request_reset'>request reset</a>
<?php endif; ?>
</body></html>
