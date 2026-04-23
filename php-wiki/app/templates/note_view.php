<!doctype html><html><body>
<h2><?= htmlspecialchars($note['title']) ?></h2>
<?php if ($unsafeRender): ?>
<div><?php // TRAINING HOOK (UNSAFE): raw render of stored content
echo $note['body']; ?></div>
<?php else: ?>
<div><?= nl2br(htmlspecialchars($note['body'])) ?></div>
<?php endif; ?>
<a href='/?r=notes'>back</a>
</body></html>
