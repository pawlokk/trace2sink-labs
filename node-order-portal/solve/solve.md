# blackbox recon
- full UI walkthrough with burp
- map frontend endpoints, parameters, roles
- success criteria:
	- [ ] complete burp sitemap
	- [ ] knowledge of every major user flow
```
# app func overview based on routing:

→ admin: 
$URL/admin/imports → GET view user webhooks 
$URL/admin/settings → PATCH updating settings via object merge 

→ API:
$URL/api/summary → GET get all products 

→ Auth:
$URL/auth/register → POST an account 
$URL/auth/login → POST for a session token auth_token
$URL/auth/logout → POST clearing the auth_token cookie

→ orders:
$URL/orders → POST to create a product 
$URL/orders → GET for order details if role==='admin'
$URL/:id → PATCH values of order
$URL/:id → DELETE order

→ products:
$URL/products → POST to create a product 
$URL/products → GET to get all products
$URL/products/search → POST to search for a product
$URL/:id → PATCH to edit values if owner or admin
$URL/:id → DELETE to delete product if owner or admin

→ profile:
$URL/profile/me → GET to get user details
$URL/profile/me → PATCH to edit user details (interesting object details)

→ webhook:
$URL/inventory-sync → POST to send data via webhook
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
adminRoutes.js:
router.get('/imports') → rendering of user controllable input 
router.patch('/settings') → applyMerge() used! possible object pollution
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
- POST params
- URL/path params
- query strings
- JSON body
- XML body
- multipart/form-data

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
- note down transformations/filters
- "can i reach this sink without intended flow?"
- success criteria:
	- [ ] every sink is mapped to at least one source
	- [ ] every value that reaches each sink is enumerated for control
```
# all sinks list:

database
---
- raw SQL query execution
- ORM queries with dynamic input
- dynamic query construction
- second-order query usage (stored → later query)

file operations
---
- file read (open, readfile, file_get_contents)
- file write (write, save, upload)
- file include/import (include, require, dynamic load)
- path construction (user input → file path)

code execution
---
- system/exec/shell execution
- eval / dynamic code execution
- runtime execution APIs
- command wrappers / helpers

serialization / parsing
---
- deserialization (binary, JSON, XML, YAML)
- object mappers (automatic binding)
- XML parsers
- custom parsers
- import/export processors

rendering / templating
---
- template rendering engines
- dynamic template selection
- string interpolation into templates
- stored data rendered in views/admin panels

network / outbound requests
---
- HTTP requests (fetch, curl, requests, etc.)
- internal service calls
- webhook triggers
- URL fetch/import features

authentication / session handling
---
- login/session creation
- token generation/validation
- password reset handling
- session state updates

authorization / access control
---
- role checks
- permission checks
- object ownership validation
- admin-only logic gates

application logic / state change
---
- create/update/delete operations
- workflow transitions
- multi-step processes (reset, checkout, approval)
- business logic enforcement points

headers / protocol output
---
- response headers (Location, Set-Cookie, etc.)
- redirects
- CORS headers
- content-type responses

configuration / secrets usage
---
- use of secrets/keys in logic
- debug/dev mode behavior
- feature flags
- environment-based branching

external integrations
---
- third-party APIs
- payment providers
- email systems
- storage backends
- identity providers

data reuse / second-order sinks
---
- stored user input reused later
- data passed across components (DB → template → exec)
- background jobs processing stored data
- admin/report/export features consuming stored data
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
