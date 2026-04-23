# frontend functionalities

```
funcs:
- home
	- search through created notes
	- create notes; title + body

- profile
	- email displayed
	- role displayed
	- change display name
	- change theme
	- avatar upload

- admin
	- forbidden 403

- api
	- /notes - representation of notes

- reset
	- password reset - token gen. sent to email (broken func)
	- confirm reset; email, token, new password input
- logout
	- logs you out xD
	
- register
	- display name, email, password function
```

# code map

- routes
```
/public
index.php:
- entrypoints
	- home 
	- register
	- login
	- logout
	- reset
	- profile
	- note/create
	- note/delete
	- admin
	- admin/moderate
	- api/notes
	- default
```

- code tree
```
├── data
│   ├── app.db
│   └── uploads
│       └── u4_5a046fcd.png
├── docker
│   └── apache.conf
├── docker-compose.yml
├── Dockerfile
├── public
│   └── index.php
├── README.md
├── scripts
│   ├── init_db.php
│   └── reset_lab.sh
└── src
    ├── bootstrap.php
    ├── controllers
    │   ├── admin_controller.php 
    │   ├── auth_controller.php
    │   ├── note_controller.php
    │   └── profile_controller.php
    ├── lib
    │   ├── auth.php
    │   ├── db.php
    │   ├── helpers.php
    │   ├── note_repo.php
    │   ├── reset_tokens.php
    │   ├── template.php
    │   └── user_repo.php
    └── views
        ├── admin_dashboard.php
        ├── layout.php
        ├── login.php
        ├── note_edit.php
        ├── note_list.php
        ├── profile.php
        ├── register.php
        └── reset.php
```

- general code flow
```
/data -> for uploads, and the .db file for the app
/docker -> apache.conf 
/public -> .htaccess and index.php with entrypoints
/scripts -> lab helpers, init_db and lab_reset

/src -> this is where the app lives 
/src/controllers -> helper functions that the logic uses
/src/lib -> define the app logic, auth, db entries, notes, etc.
/src/views -> define the 'UI' -> forms, links, the app views

user enters the URL in browser
↓
index.php → /r?=home (or other route) 
↓
specific controller →  for home it's: auth_controller, 
↓
controller calls specific lib file (e.g. prepared SQL query for note searching)
↓
controller calls render_page from lib/template.php 
↓
template.php renders a specific .php file from views/ 
↓
when user chooses a specific action, like /?r=note/create, we can trace that via index.php and routing mechanism
↓
so /?r=note/create will take us to index.php and call note_create_post();
↓
this takes us to the specific controller, which calls lib files, and renders or redirects to a specific page
```

- user inputs
```
→ index.php:
$route = $_GET['r'] → route selection
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';


controllers/
------------
→ admin_controller.php:
# moderating posts
$noteId = (int)($_POST['id'] ?? 0); 
$flag = ((string)($_POST['flag'] ?? '0') === '1');

---
→ auth_controller.php:

#auth_login_post
$email = post_str('email'); // $_POST
$password = post_str('password'); // $_POST

#auth_register_post
$email = post_str('email');
$password = post_str('password');
$displayName = post_str('display_name');

#auth_reset_post
$step = post_str('step', 'request');
↓
$email = post_str('email');
$user = find_user_by_email($email);
↓
$email = post_str('email');
$token = post_str('token');
$newPassword = post_str('new_password');

---
→ note_controller.php
#notes_index
$search = (string)($_GET['q'] ?? '');
$rawMode = (string)($_REQUEST['raw'] ?? '0') === '1';

#note_create_post
$title = post_str('title');
$body = post_str('body');

#note_edit_get
$noteId = get_int('id');

#note_edit_post
$noteId = (int)($_POST['id'] ?? 0);
$title = post_str('title');
$body = post_str('body');

#note_delete_post
$noteId = (int)($_POST['id'] ?? 0);

---
→ profile_controller.php
#profile_update_post
$displayName = post_str('display_name');
$theme = post_str('theme', 'light');
if (!empty($_FILES['avatar']['name'])) {
$name = (string)$_FILES['avatar']['name'];
$tmp = (string)$_FILES['avatar']['tmp_name'];

*available but not used are mimetype, size, and error code in upload*



lib/
---------
→ auth.php
#login_user
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['role'] = (string)$user['role'];

#require_admin
if ((current_user_role() == 'admin') || (($_COOKIE['is_admin'] ?? '') == '1')) {


---
→ db.php
nottin, only queries 

---
→ helpers.php
#helpers for functions post_str and get_str
return trim((string)($_POST[$key] ?? $default));
return (int)($_GET[$key] ?? $default);

#flash_set
$_SESSION['flash'] = $msg;

#flash_get
$m = $_SESSION['flash'] ?? '';

#current_user_id
return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

#current_user_role
return $_SESSION['role'] ?? null;

---
→ note_repo.php
only but no direct user input SQL queries



views/
---------
→ html pages but no direct PHP inputs
```

- sinks
```
# all sinks list:

database
---
#note_repo.php → lots of db operations
create_note() → db()->prepare into execute()
update_note() → db()->prepare into execute()
delete_note() → db()->prepare into execute()
find_note() → db()->prepare into execute()
list_notes_for_user() → db()->prepare into execute()
list_all_notes() → db()->prepare into execute()
set_note_flag() → db()->prepare into execute()
user_owns_note() → db()->prepare into execute()
search_notes_for_user() → db()->prepare into execute()

#reset_tokens.php
issue_reset_token() → db()->prepare into execute()
consume_reset_token() → db()->prepare into execute()

#user_repo.php
seed_users_if_missing() → db()->prepare into execute()
create_user() → db()->prepare into execute()
find_user_by_email() → db()->prepare into execute()
find_user_by_id() → db()->prepare into execute()
update_profile() → db()->prepare into execute()
update_password() → db()->prepare into execute()

file ops
---
#profile_controller.php
profile_update_post() → move_uploaded_file()

code exec
---
none

serialization
---
#profile_controller.php
profile_get() -> @unserialize()

rendering/templating
---
#template.php
render_page() → layout.php → include$viewFile; 

#views/*.php → dangerous variables rendered
*also some echo() functions but without controllable input*

network
---
none

auth
---
#auth.php
login_user() → sets session variables if user logged successfully via auth_login_post() in auth_controller.php
logout_user() → unsets these variables and deletes cookie

#reset_tokens.php
consume_reset_token()
issue_reset_token()

these two use the prepare&execute db queries style 

logical
---
various notes operations 

header/protocol
---
#helpers.php
redirect() -> header() function

state/event change
---
notes operations in note_repo.php → they all use prepare&execute sql
create_note()
update_note()
delete_note()
find_note()
list_notes_for_user()
list_all_notes()
set_note_flag()
user_owns_note()
search_notes_for_user()
 
profile updates in profile_controller.php
profile_update_post() -> file ops, preferences and unserialize

account updates in user_repo.php → all using prepare&execute
update_profile()
update_password()
create_user()

moderation flag update in admin_controller.php
admin_moderate_post()

password reset token issue and consume in auth.php
issue_reset_token()
consume_reset_token()


access control
---
#auth.php
require_admin()
require_login()

configuration
---
none

ext. integration
---
none
```