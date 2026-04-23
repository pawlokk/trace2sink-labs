# Whitebox Methodology (trace2sink-labs)

Purpose: a repeatable, exam-relevant workflow for small vulnerable labs.

## Core Principles
- Start from sinks, not payload guessing.
- Trace full flow: request -> middleware/auth -> helper/service -> sink.
- Kill dead paths fast.
- Think in chains, not isolated bugs.
- Script validated chains immediately.

## 2-Hour Audit Loop

### Phase 0 (0-10m): Orientation
- Identify stack and entrypoint files.
- Locate auth/session/role handling.
- Identify app modules and admin area.

Output:
- route entry files
- auth/session file(s)
- high-level app shape

### Phase 1 (10-30m): High-Value Surface
Map only high-value endpoints:
- auth/register/login/reset
- CRUD create/update/delete
- admin-only actions
- import/upload/webhook/parsing paths
- API endpoints

Output:
- shortlist of candidate routes

### Phase 2 (30-60m): Sink Discovery
Enumerate sink classes:
- DB query construction
- file/path/include/upload usage
- rendering/templating
- parser/deserialization
- dynamic execution/eval-like helpers
- outbound/internal requests

For each sink:
- which variable reaches sink?
- where assigned/transformed?
- what trust boundary crossed?

Output:
- 3-5 candidate source->sink paths

### Phase 3 (60-90m): Backtrace and Control
Backtrace sink -> source:
- input origin (`params`, `body`, `headers`, `cookies`, stored data)
- transformations and filters
- auth/authz and object ownership checks
- full vs partial control
- first-order vs second-order reachability

Output:
- 1-2 realistic vulnerability paths

### Phase 4 (90-120m): Validate and Script
- build minimal PoC to confirm control + impact
- add bypass/chaining only after confirmation
- script full deterministic sequence (no manual steps)

Output:
- reproducible exploit script or confirmed dead end

## Data-Flow Checklist
For each major feature, explicitly map:
- entry point route
- middleware chain
- identity/session flow
- user-controlled fields
- transformations/helpers
- final sink
- trust boundary assumptions

## Stuck Protocol
If blocked:
- stop blind payload mutation
- re-trace best sink path from scratch
- switch angle: direct -> second-order, controller auth -> object auth
- prioritize admin/import/reset flows
- restart Phase 1 on top 4 high-value areas only

## Lab Completion Criteria
A lab is "done" when you have:
- a route/sink map you can explain quickly
- at least one validated chain
- a deterministic exploit script
- short notes on lessons learned and framework caveats
