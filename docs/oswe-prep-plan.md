# OSWE Prep Plan (for trace2sink-labs)

Goal: consistent whitebox speed under exam conditions.

## Weekly Structure (6-8h/week)

### Block A (2h): Build or extend one mini-lab
- keep feature set minimal
- include explicit safe/unsafe hook toggles
- ensure docker + seed + reset + debug work

### Block B (2h): Timed audit run
- run full 2-hour methodology loop
- produce sink shortlist and one chain hypothesis

### Block C (1-2h): Exploit scripting
- implement deterministic Python PoC
- include auth/session handling and full request sequence

### Block D (1-2h): Review and retention
- write short post-lab notes:
  - what trust boundary failed
  - why control was possible
  - how chain escalated impact

## 6-Week Track

### Week 1: PHP flow mastery
- globals/session/auth/reset/path handling
- output: one reproducible chain + script

### Week 2: Node.js object trust
- middleware, JWT/cookie flow, object merge, NoSQL query construction
- output: one object-trust chain + script

### Week 3: Flask SQL/template flow
- decorators, object auth, raw query/template risks
- output: one server-side injection or authz chain + script

### Week 4: .NET binding and service-layer auth
- model binding/over-posting, DTO->entity trust, ownership checks
- output: one binding/authz chain + script

### Week 5: Spring Boot mapper/parser flow
- controller->service->repo, parser config, DTO trust
- output: one parser/mapping/auth chain + script

### Week 6: Mixed timed repetitions
- 2-3 short audits from scratch (90-120m each)
- output: faster sink identification and cleaner scripts

## Per-Lab Deliverables
- route + sink map
- trust-boundary notes
- exploit script (end-to-end)
- short remediation notes (for learning contrast)

## Quality Gates
Before calling a lab complete:
- app starts with one command (`docker compose up -d --build`)
- reset/reseed takes < 2 minutes
- debugger attach works reliably
- at least one chain is validated, not hypothetical
- exploit script runs without manual edits

## Minimal Tracking Template
Use this for each lab:
- Lab:
- Stack:
- Timeboxed audit duration:
- Confirmed sink:
- Source->sink path summary:
- Chain steps:
- Script status:
- Lessons learned:
