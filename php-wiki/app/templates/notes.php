<!doctype html><html><body>
<h2>Notes</h2>
<form method='get'><input type='hidden' name='r' value='notes'><input name='q' value='<?= htmlspecialchars($query) ?>' placeholder='search title'><button>search</button></form>
<form method='post'><input name='title' placeholder='title'><textarea name='body' placeholder='body'></textarea><button>create</button></form>
<ul>
<?php foreach ($notes as $n): ?>
<li><a href='/?r=note_view&id=<?= (int)$n['id'] ?>'><?= htmlspecialchars($n['title']) ?></a></li>
<?php endforeach; ?>
</ul>
<a href='/?r=home'>home</a>
</body></html>
