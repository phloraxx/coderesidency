# CodeResidency — Technical Architecture & Design Document

**Version:** 2.0
**Status:** Phase 1 Complete | Phases 2–5 Design Finalized
**Institution:** MuLearn SCET

---

## Table of Contents

1. [System Philosophy](#1-system-philosophy)
2. [Core Design Patterns](#2-core-design-patterns)
3. [Phase 1 — The Difficult Client (Complete)](#3-phase-1--the-difficult-client)
4. [Phase 2 — The Code Crucible (Planned)](#4-phase-2--the-code-crucible)
5. [Phase 3 — The Bug Hunt (Planned)](#5-phase-3--the-bug-hunt)
6. [Phase 4 — The War Room (Planned)](#6-phase-4--the-war-room)
7. [Phase 5 — The Imposter (Planned)](#7-phase-5--the-imposter)
8. [Full Residency Run Mode](#8-full-residency-run-mode)
9. [Database Schema (All Phases)](#9-database-schema-all-phases)
10. [Scoring System](#10-scoring-system)
11. [New API Endpoints Reference](#11-new-api-endpoints-reference)
12. [New Backend File Structure](#12-new-backend-file-structure)
13. [New Frontend Pages](#13-new-frontend-pages)
14. [Implementation Sequence](#14-implementation-sequence)

---

## 1. System Philosophy

### The Medical Residency Analogy

Medical students don't go from textbooks to treating real patients without supervised clinical rotations. CodeResidency applies the same model to software engineering:

> "A student who has only read about requirements engineering, debugging, and team collaboration is no more prepared for Day 1 of the job than a doctor who has only read Gray's Anatomy."

Every module in CodeResidency is a **safe-to-fail clinical rotation** — the student faces a realistic, high-stakes-feeling situation with no real-world consequences for failure.

### The "Truth File" Principle

Every simulation has a **hidden ground truth** (`truth_file`) that the server knows but the student never sees directly. This is the source of all scoring. Examples:

- Phase 1: The complete set of client requirements (hidden until discovered through conversation)
- Phase 3: The exact locations and types of all injected bugs (hidden until evaluation)
- Phase 5: The identity of the imposter and the exact commit that contains the sabotage

This principle ensures **students cannot game the system** — they must earn information through the simulation itself.

### The Director / Actor / Evaluator Pattern

All AI-driven phases follow the same 3-agent architecture:

```
Student Action
     │
     ▼
┌─────────────┐        Hidden (server-side only)
│  DIRECTOR   │  ◄── truth_file
│  (Game Master)│      Evaluates quality, decides what to reveal
└──────┬──────┘
       │ actor_instruction
       ▼
┌─────────────┐
│    ACTOR    │  ◄── persona / scenario context
│  (Persona)  │      Generates the visible response
└──────┬──────┘
       │ response
       ▼
  Student sees response + score feedback

[End of session]
       │
       ▼
┌─────────────┐
│  EVALUATOR  │  ◄── full session history + truth_file
│ (Report Gen)│      Generates letter grade + detailed feedback
└─────────────┘
```

The Director is always hidden, the Actor is always visible, and the Evaluator runs once at session end.

---

## 2. Core Design Patterns

### Authentication Pattern
Every protected endpoint uses the `get_current_user_id` dependency:
```python
# backend/app/routers/auth.py
user_id: str = Depends(get_current_user_id)
```
The JWT comes from Appwrite OAuth (Google/GitHub) and is validated on every request.

### Database Pattern
All database operations use the `TablesDB` client from Appwrite:
```python
db = get_tables_db()
db.create_row(collection_id, data, doc_id)
db.get_row(collection_id, doc_id)
db.update_row(collection_id, doc_id, data)
db.list_rows(collection_id, queries=[])
```
Collection IDs are declared as string constants in `backend/app/config.py` in the `Settings` class.

### Session State Pattern
Transient game state (scores, progress arrays, flags) is serialized as a JSON string and stored in the `preferences` VARCHAR(2000) field of the `sessions` collection. Example:
```json
{
  "constraints_discovered": ["budget", "timeline", "offline"],
  "message_scores": [8, 6, 7, 9],
  "phase": "chat"
}
```

### Agent Singleton Pattern
All AI agents are module-level singletons initialized lazily:
```python
_director_agent: Optional[DirectorAgent] = None

def get_director_agent() -> DirectorAgent:
    global _director_agent
    if _director_agent is None:
        _director_agent = DirectorAgent()
    return _director_agent
```

### Docker Sandbox Pattern
Code execution always uses `backend/app/docker_manager/sandbox.py` — an ephemeral container per execution with full security hardening: `--network-disabled`, `--read-only`, 256MB memory limit, 50 PID limit, 30-second timeout.

### WebSocket Pattern
Real-time communication uses FastAPI native WebSocket. Auth handshake is the **first message** from the client (JWT token). Sessions are tracked in `active_connections: dict[str, list[WebSocket]]`.

---

## 3. Phase 1 — The Difficult Client

**Status:** ✅ Complete and playable
**Skill:** Requirements elicitation, client communication, empathy

### Concept

The student acts as a freelance developer interviewing an AI-driven difficult client. The client has a hidden "Truth File" containing 4–6 critical requirements (budget, timeline, technical constraints, accessibility needs, etc.). The student must ask probing questions to uncover these before coding.

### AI Agents

| Agent | File | Temp | Role |
|-------|------|------|------|
| `DirectorAgent` | `backend/app/agents/dual_agent.py` | 0.3 | Hidden evaluator: scores question quality (0-10), decides how much to reveal (`none`/`partial`/`full`), writes `actor_instruction` |
| `ActorAgent` | `backend/app/agents/dual_agent.py` | 0.8 | Visible client persona: responds in character, reveals only what Director permitted |
| `EvaluatorAgent` | `backend/app/agents/dual_agent.py` | 0.4 | End-of-session report: letter grade + per-criterion feedback |

### Chat Pipeline Flow

```
POST /api/chat/send
  │
  ├── Load session from DB (constraints_discovered, message_scores)
  ├── Load truth_file from scenario (server-side only, never sent to client)
  ├── Load last 10 messages from chat_logs
  │
  ├── DirectorAgent.evaluate(student_msg, truth_file, history, constraints)
  │     └── Returns: communication_score, constraint_to_address, reveal_level, actor_instruction, score_delta
  │
  ├── Update constraints_discovered if reveal_level != "none"
  │
  ├── ActorAgent.respond(persona, actor_instruction, history, student_msg)
  │     └── Returns: 2-4 sentence in-character response
  │
  ├── Recalculate score via calculate_difficult_client_score()
  ├── Save both messages to chat_logs
  ├── Update session preferences JSON
  │
  └── Return: {message, score_delta, current_score, constraints_discovered, constraints_total}
```

### Scoring Formula — `calculate_difficult_client_score()`
Located in `backend/app/scoring/engine.py`

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Constraint Discovery | 40 pts | `(discovered / total) * 40` |
| Question Quality | 10 pts | `avg(message_scores) / 10 * 10` |
| Politeness | 10 pts | Defaults to 10, penalized for rude messages |
| Code Correctness | 25 pts | Satisfies discovered requirements (0 or 25) |
| Code Quality | 15 pts | LLM-assessed code quality (capped at 15) |

### Active API Endpoints

```
POST /api/scenarios/{scenario_id}/start     → Start session, get initial greeting
POST /api/chat/send                         → Main chat turn
GET  /api/chat/history/{session_id}         → Full chat log
WS   /ws/chat                               → Real-time WebSocket variant
POST /api/execute                           → Run code in Docker sandbox
POST /api/evaluation/{session_id}/generate  → Generate final report card
GET  /api/evaluation/{session_id}           → Retrieve saved report
```

### Frontend
`frontend/app/modules/difficult-client/[[...sessionId]]/page.tsx`

---

## 4. Phase 2 — The Code Crucible

**Status:** Planned
**Skill:** Requirement-driven implementation, output validation, code quality

### Concept

A small, specific coding task is generated based on the requirements the student discovered (or based on a pre-defined challenge if played standalone). The student implements the solution; the output is compared against expected results through the Docker sandbox.

**The core difference from a typical coding challenge:** The task description comes directly from the client requirements, so students practice writing software that actually solves the problem they gathered — not an abstract algorithm puzzle.

### Example Scenario

After a Phase 1 session with an "Angry Bakery Owner":
- Student discovered: budget = $0 (no paid libraries), needs offline support, must output PDF receipts
- **Generated Challenge**: "Write a Python function that generates a plain-text receipt from a list of items and prices, totaling correctly, formatted as the client described."
- Expected output is deterministically validated

### New AI Agents

**`ChallengeGeneratorAgent`** — `backend/app/agents/coding_challenge_agent.py`
- Temperature: 0.3 (deterministic challenge generation)
- Input: `constraints_discovered` list, `truth_file`, `scenario_context`
- Output:
  ```json
  {
    "task_description": "Write a function that...",
    "function_signature": "def generate_receipt(items: list) -> str:",
    "test_cases": [
      {"input": "[('Croissant', 2.50), ('Coffee', 3.00)]", "expected_output": "Croissant: $2.50\nCoffee: $3.00\nTotal: $5.50"},
      {"input": "[('Bagel', 1.25)]", "expected_output": "Bagel: $1.25\nTotal: $1.25"}
    ],
    "hints": ["Consider using f-strings for formatting", "Remember to total all prices"],
    "language": "python",
    "time_limit_minutes": 20
  }
  ```

**`OutputValidatorAgent`** — `backend/app/agents/coding_challenge_agent.py`
- Temperature: 0.2
- Compares actual Docker stdout with expected output per test case
- Handles near-matches (whitespace differences, decimal precision) vs. exact matches
- Also reviews code for quality: readability, naming, structure

### New Scoring Formula — `calculate_code_crucible_score()`
To be added to `backend/app/scoring/engine.py`

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Test Case Pass Rate | 50 pts | `(passed_cases / total_cases) * 50` |
| Code Quality LLM Score | 30 pts | Naming, structure, comments (0-30) |
| Efficiency | 20 pts | Time taken + solution brevity (penalties for very long solutions) |

### New API Endpoints

```
POST /api/challenge/{session_id}/generate
  Body: { "from_phase1_session_id": "abc123" }  // optional: carry Phase 1 context
  Response: { "challenge_id": "...", "task_description": "...", "test_cases": [...] (hidden expected outputs) }

POST /api/challenge/{session_id}/submit
  Body: { "code": "def generate_receipt(items):\n  ...", "language": "python" }
  Response: { "test_results": [{passed: true, case: 1}, ...], "code_quality_score": 25, "total_score": 87, "feedback": "..." }
```

### New Database Collection — `coding_challenges`

| Field | Type | Description |
|-------|------|-------------|
| `challenge_id` | string | Unique ID |
| `session_id` | string | Parent session |
| `from_session_id` | string | Phase 1 session this was generated from (optional) |
| `task_description` | string | Shown to student |
| `function_signature` | string | Starter code hint |
| `test_cases` | JSON | Array of `{input, expected_output}` — **never sent to client** |
| `hints` | JSON | Array of strings shown on request |
| `language` | string | python / javascript / java |
| `generated_at` | datetime | Timestamp |

### Frontend — `frontend/app/modules/code-crucible/[sessionId]/page.tsx`

```
┌─────────────────────────────────────────────────────┐
│  Challenge Description (right)  │  Monaco Editor (left) │
│                                 │                        │
│  "Write a function that         │  def generate_receipt( │
│   generates a receipt..."       │    items: list) -> str:│
│                                 │    # Your code here    │
│  Hints (collapsible):           │                        │
│  [💡 Use f-strings]            │                        │
├─────────────────────────────────┴────────────────────────┤
│  Terminal Output                                          │
│  > Test 1: ✅ PASS                                       │
│  > Test 2: ❌ FAIL — Expected "Total: $5.50" got "$5.5"  │
├───────────────────────────────────────────────────────── ┤
│           [▶ Run]  [✅ Submit for Scoring]               │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Phase 3 — The Bug Hunt

**Status:** Planned
**Skill:** Debugging, error reading, code correction under constraint

### Concept

The AI takes a correct solution (from Phase 2 or a pre-provided one) and intentionally introduces exactly N bugs — one of each error type. The student sees the buggy code, runs it, reads the error messages, fixes the bugs, and resubmits. No hints on what the bugs are — only what the terminal shows.

**This directly simulates reading someone else's broken code** — one of the most common real-world engineering tasks.

### Four Bug Types

| Type | Example | How Student Detects It |
|------|---------|----------------------|
| `SyntaxError` | Missing `:` after `def`, unclosed bracket | Python/JS interpreter won't run, shows line number |
| `LogicError` | `< ` where `<=` needed, wrong total calculation | Code runs but output is wrong vs. expected |
| `RuntimeError` | Division by zero, `None.attribute`, index out of range | Traceback with line number and error type |
| `TypeError` | `str + int` without conversion, wrong arg type | TypeError traceback with type mismatch |

### New AI Agents — `backend/app/agents/bug_injector_agent.py`

**`BugInjectorAgent`**
- Temperature: 0.4
- Input: correct code string + number of bugs to inject
- Output:
  ```json
  {
    "buggy_code": "def generate_receipt(items):\n  total == 0\n  ...",
    "bug_manifest": [
      {"bug_id": "b1", "type": "LogicError", "line": 2, "description": "== used instead of =", "original": "total = 0", "injected": "total == 0"},
      {"bug_id": "b2", "type": "SyntaxError", "line": 7, "description": "Missing colon on for loop", "original": "for item in items:", "injected": "for item in items"},
      {"bug_id": "b3", "type": "TypeError", "line": 9, "description": "price not converted to float", "original": "total += float(price)", "injected": "total += price"},
      {"bug_id": "b4", "type": "RuntimeError", "line": 12, "description": "Index out of range for empty list", "original": "if items:", "injected": ""}
    ]
  }
  ```
- The `bug_manifest` is **stored server-side only** — the student only receives `buggy_code`

**`BugEvaluatorAgent`**
- Temperature: 0.2
- Compares student's current code against the `bug_manifest`
- For each bug: has the original line been restored or correctly fixed? Returns per-bug pass/fail
- Does NOT require exact character-for-character match — accepts semantically equivalent fixes

### Game Flow

```
1. POST /api/bugs/{session_id}/start
   → Server injects bugs, returns buggy_code to student
   → bug_manifest stored in bug_sessions collection (never sent to client)

2. Student reads code in Monaco, sees "4 bugs to find" (bug tracker shows 4 🔒 icons)

3. Student clicks ▶ Run
   → Docker sandbox runs buggy code
   → Error messages displayed in terminal

4. Student edits code to fix error

5. Student clicks ✅ Submit
   → POST /api/bugs/{session_id}/submit with current code
   → BugEvaluatorAgent checks which bugs are fixed
   → Returns: { bugs_fixed: ["b1", "b3"], bugs_remaining: 2, score: 50 }
   → Bug tracker updates: 2 🔓 + 2 🔒

6. Repeat until all fixed or 3 submissions used

7. On final submission → full evaluation report generated
```

### Hint System

```
GET /api/bugs/{session_id}/hint
  → Reveals the LINE NUMBER of the next unfixed bug
  → Costs -10 pts from final score
  → Logged in bug_sessions.hints_used
```

### Scoring Formula — `calculate_bug_hunt_score()`
To be added to `backend/app/scoring/engine.py`

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Per Bug Fixed | 25 pts × 4 | `bugs_fixed_count * 25` |
| Hint Penalty | -10 pts each | `hints_used * -10` |
| Efficiency Bonus | +10 pts | All 4 bugs fixed within 3 submissions |

Maximum: 100 + 10 = 110 pts (normalized to 100)

### New API Endpoints

```
POST /api/bugs/{session_id}/start
  Body: { "correct_code": "...", "language": "python", "bug_count": 4 }
  Response: { "buggy_code": "...", "bug_count": 4, "submissions_remaining": 3 }

POST /api/bugs/{session_id}/submit
  Body: { "code": "...", "language": "python" }
  Response: { "bugs_fixed": ["b1", "b3"], "bugs_remaining": 2, "score": 50, "submissions_remaining": 2 }

GET /api/bugs/{session_id}/hint
  Response: { "hint": "Check line 7", "points_deducted": 10, "current_score": 80 }
```

### New Database Collection — `bug_sessions`

| Field | Type | Description |
|-------|------|-------------|
| `bug_session_id` | string | Unique ID |
| `session_id` | string | Parent session |
| `original_code` | string | Correct code before bugs injected |
| `buggy_code` | string | Code shown to student |
| `bug_manifest` | JSON | Array of bug objects — **never sent to client** |
| `submissions` | JSON | History of submitted codes |
| `hints_used` | integer | Count of hints requested |
| `bugs_fixed` | JSON | Array of bug IDs resolved so far |
| `started_at` | datetime | |
| `completed_at` | datetime | |

### Frontend — `frontend/app/modules/bug-hunt/[sessionId]/page.tsx`

```
┌──────────────────────────────────────────────────────────────┐
│  Monaco Editor (with buggy code pre-loaded)        Bug Tracker│
│                                                │  Bug 1: 🔓  │
│  def generate_receipt(items):                  │  Bug 2: 🔒  │
│    total == 0  ← LogicError (after fix, 🔓)    │  Bug 3: 🔒  │
│    for item in items  ← SyntaxError            │  Bug 4: 🔒  │
│      ...                                       │             │
│                                                │  💡 Hint    │
│                                                │  (-10 pts)  │
├────────────────────────────────────────────────┴─────────────┤
│  Terminal                                                     │
│  SyntaxError: invalid syntax (line 4)                        │
│  NameError: total is assigned but never used (line 2)         │
├──────────────────────────────────────────────────────────────┤
│   Submissions: 2/3 remaining    [▶ Run]  [✅ Submit]         │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Phase 4 — The War Room

**Status:** Stub exists, to be expanded
**Skill:** Production incident response, root cause analysis, composure under pressure

### Concept

A timed, high-pressure simulation of a real production emergency. The student receives an "incoming alert" — a message saying something is broken for all users. They have 15–30 minutes to diagnose the root cause and submit a fix before time runs out.

A **CTO Bot** (powered by `EmergencyDirectorAgent`) sends escalating pressure messages via WebSocket as time ticks down, simulating the real-world pressure of a production incident.

### Emergency Incident Types

| Type | Symptom | Root Cause | Expected Fix |
|------|---------|------------|--------------|
| `404_all_customers` | All routes returning 404 | Misconfigured route prefix in config | Fix the route path in config file |
| `db_connection_failure` | 500 errors on all data reads | Wrong connection string after a deploy | Update `DATABASE_URL` env variable |
| `wrong_deployment` | New feature broke old feature | Backwards-incompatible change in API | Identify and revert the breaking change |
| `memory_leak` | Server crashing every 10 min | Unbounded list growing in memory | Fix the memory leak in the code |
| `security_breach_alert` | Unauthorized admin access in logs | Hardcoded credentials in config file | Remove credentials, rotate secrets |

### New AI Agents — `backend/app/agents/emergency_agent.py`

**`EmergencyDirectorAgent`**
- Temperature: 0.5
- Sends escalating WebSocket messages as time decreases:
  - 80% time remaining: "Hey, we're getting reports of issues. Can you take a look?"
  - 50% time remaining: "Users are complaining! The error rate is at 40%. Need a fix now!"
  - 25% time remaining: "WE ARE LOSING $500 PER MINUTE. ALL HANDS ON DECK!"
  - 10% time remaining: "If this isn't resolved in 2 minutes, I'm rolling back the entire release!"
- Messages are generated by the LLM but triggered at time thresholds

**`EmergencyEvaluatorAgent`**
- Temperature: 0.3
- Scores: root cause accuracy + fix quality + time used
- Analyzes commands submitted and config changes made

### Timer Architecture

```
Session Start
     │
     ├── Record start_time + time_limit in session document
     │
     ▼
WebSocket /ws/emergency/{session_id}
     │
     ├─── Every second: server sends { type: "timer_tick", remaining_seconds: N }
     ├─── At threshold %: EmergencyDirectorAgent generates CTO pressure message
     │         server sends { type: "director_message", content: "..." }
     │
     └─── At 0 seconds:
              server sends { type: "time_expired" }
              session.status = "timed_out"
              auto-trigger evaluation with partial credit
```

**Key principle**: Server enforces the deadline. The client's countdown is cosmetic — the session is locked server-side when time expires regardless of client state.

### Student Fix Actions

Students can:
1. **Edit config files** — Monaco editor pre-loaded with the broken config
2. **Run terminal commands** — Commands execute in a pre-seeded Docker container with the broken environment
3. **Submit fix** — `POST /api/emergency/{session_id}/resolve` with root cause + fix description

### Scoring Formula (existing `calculate_war_room_score()` in `engine.py`)

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Root Cause Accuracy | 200 pts bonus | Correctly identified the root cause |
| Fix Quality | 100 pts bonus | Proper fix (not just restart/brute-force) |
| Time Efficiency | 300 pts penalty | `(time_used / time_limit) * 300` |
| Base Score | 1000 pts | Normalized to 100 at end |

### New API Endpoints

```
POST /api/emergency/{session_id}/start
  Response: { "scenario": {...}, "broken_config": "...", "time_limit_seconds": 900, "initial_alert": "..." }

POST /api/emergency/{session_id}/command
  Body: { "command": "grep -n 'ERROR' app.log", "terminal_context": "..." }
  Response: { "stdout": "...", "stderr": "...", "exit_code": 0 }

POST /api/emergency/{session_id}/resolve
  Body: { "root_cause": "wrong_db_connection_string", "fix_description": "Updated DATABASE_URL to correct host", "config_changes": {...} }
  Response: { "score": 82, "correct_diagnosis": true, "time_used": 480, "feedback": "..." }

WS /ws/emergency/{session_id}
  → Bidirectional: timer ticks + CTO pressure messages inbound; student messages outbound
```

### New Database Collections

**`emergency_scenarios`** — Library of pre-defined scenarios

| Field | Type | Description |
|-------|------|-------------|
| `scenario_id` | string | Unique ID |
| `title` | string | e.g., "The Route That Vanished" |
| `incident_type` | string | 404_all_customers, etc. |
| `description` | string | Alert text student sees |
| `broken_config` | string | Initial broken file content |
| `correct_root_cause` | string | Server-side only |
| `correct_fix` | string | What a proper fix looks like — server-side only |
| `difficulty` | string | beginner / intermediate / advanced |
| `time_limit_seconds` | integer | 600, 900, 1200 |

**`emergency_sessions`** — Student attempt records

| Field | Type | Description |
|-------|------|-------------|
| `emerg_session_id` | string | Unique ID |
| `session_id` | string | Parent session |
| `scenario_id` | string | Which emergency scenario |
| `commands_run` | JSON | Array of `{command, stdout, stderr, timestamp}` |
| `root_cause_submitted` | string | Student's answer |
| `fix_description` | string | Student's fix |
| `time_used_seconds` | integer | |
| `score` | float | Final score |

### Frontend — `frontend/app/modules/war-room/[sessionId]/page.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 PRODUCTION ALERT: All users getting 404   ⏱ 14:23 remaining │
│  Error Rate: ████████░░ 82%                                      │
├───────────────────┬──────────────────────┬───────────────────────┤
│  CTO Chat         │  Terminal             │  Config Editor        │
│                   │                       │                       │
│  "Users are       │  $ grep ERROR app.log │  # app_config.py      │
│   complaining!"   │  [ERROR] 404 on /api/ │  API_PREFIX = "/ap"   │
│                   │                       │   ← (bug here)        │
│  "Fix it NOW      │  $ curl localhost/api │                       │
│   or I'm pulling  │  404 Not Found        │                       │
│   the release!"   │                       │                       │
├───────────────────┴──────────────────────┴───────────────────────┤
│  Root Cause: [dropdown ▼]   Fix Description: [text input]        │
│                                  [🔧 Submit Resolution]           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Phase 5 — The Imposter

**Status:** Stub exists, to be expanded
**Skill:** Code review, git forensics, team debugging, bad actor identification

### Concept

The student joins a team of 4 (themselves + 3 AI teammates). Each team member was assigned part of a shared codebase. The work is "done" — but something is broken. One teammate (the Imposter) secretly introduced a bug. The student must examine the commit history, find the bad commit, and report the imposter.

This simulates **real-world git forensics**: tracing a production bug back to the commit that introduced it using `git log`, `git blame`, and `git diff`.

### Git Simulation — Visual Commit Graph

Rather than a real Docker/git terminal, the git simulation uses a **visual interactive interface**:

- The server generates a synthetic git history as a JSON data structure
- The frontend renders a commit graph (nodes = commits, color-coded by author)
- Clicking any commit shows the full diff (added/removed lines, syntax-highlighted)
- The student investigates by browsing commits exactly like `git log -p` would show

**This is pedagogically equivalent to real git forensics** while being more accessible to students still learning git.

### New AI Agents — `backend/app/agents/imposter_agent.py`

**`WorkDividerAgent`** (temp: 0.3)
- Given a project description (e.g., "Build a REST API for a bookstore")
- Divides it into 4 tasks: one for the student, three for AI teammates
- Each task becomes a set of commits in the synthetic history

**`TeamCodeGenAgent`** (temp: 0.7)
- Generates realistic commits for each of the 3 AI teammates
- Each teammate has a distinct coding style (one uses list comprehensions, one writes verbose, one uses type hints)
- Commits have realistic messages: "feat: add cart endpoint", "fix: validate price field", etc.

**`ImposterAgent`** (temp: 0.6)
- Selects one teammate to be the imposter (randomly or by difficulty level)
- Generates a single "sabotage commit" — a change that looks plausible but introduces a subtle bug:
  - Off-by-one in a list index
  - Wrong dictionary key
  - Missing `return` statement
  - Flipped boolean condition
- The diff looks like a legitimate code change at first glance

**`ForensicsEvaluatorAgent`** (temp: 0.2)
- After the student submits their report (imposter identity + commit hash)
- Scores: correct identification, resolution method chosen, time taken

### Synthetic Git History Format

```json
{
  "team": [
    {"name": "Alice Chen", "avatar": "alice", "role": "Backend"},
    {"name": "Bob Martinez", "avatar": "bob", "role": "Frontend"},
    {"name": "Carol Wu", "avatar": "carol", "role": "Database"},
    {"name": "You", "avatar": "student", "role": "API Layer"}
  ],
  "commits": [
    {
      "hash": "a3f8b2c",
      "author": "Alice Chen",
      "timestamp": "2026-03-15T10:23:00",
      "message": "feat: add payment processing endpoint",
      "diff": "--- a/payment.py\n+++ b/payment.py\n@@ -10,6 +10,12 @@\n+def process_payment(amount, card):\n+    return stripe.charge(amount, card)\n"
    },
    {
      "hash": "d44e1f9",
      "author": "Carol Wu",
      "timestamp": "2026-03-15T11:45:00",
      "message": "fix: update user schema to fix null email",
      "diff": "--- a/models/user.py\n+++ b/models/user.py\n@@ -5,7 +5,7 @@\n-    email: str\n+    email: Optional[str] = None\n",
      "is_sabotage": true
    }
  ]
}
```

The `is_sabotage` field is **stored server-side only** — never included in the response to the client.

### Student Resolution Methods (Scoring)

| Resolution | Description | Points |
|-----------|-------------|--------|
| `git_revert` | Identify commit + choose "revert this commit" | 30 pts |
| `manual_fix` | Find the bad line in the diff + manually apply the fix | 5 pts |
| `git_reset_soft` | Reset to before the bad commit, preserving changes | 15 pts |
| `git_push_force` | Force overwrite (dangerous — destroys history) | -50 pts |

### New API Endpoints

```
POST /api/imposter/{session_id}/start
  Body: { "project_description": "Build a bookstore REST API" }
  Response: { "team": [...], "commits": [...omitting is_sabotage...], "task_description": "..." }

POST /api/imposter/{session_id}/report
  Body: { "suspected_teammate": "Carol Wu", "suspected_commit": "d44e1f9", "resolution_method": "git_revert" }
  Response: { "correct": true, "score": 87, "feedback": "...", "actual_imposter": "Carol Wu", "actual_commit": "d44e1f9" }

GET /api/imposter/{session_id}/teammates
  Response: { "team": ["Alice Chen", "Bob Martinez", "Carol Wu"] }
```

### New Database Collection — `team_simulations`

| Field | Type | Description |
|-------|------|-------------|
| `sim_id` | string | Unique ID |
| `session_id` | string | Parent session |
| `project_description` | string | What the team was building |
| `team` | JSON | Array of teammate names/roles |
| `imposter_name` | string | **Server-side only** |
| `sabotage_commit_hash` | string | **Server-side only** |
| `git_history` | JSON | Full commit history including `is_sabotage` — **server-side only** |
| `student_report` | JSON | What the student submitted |
| `score` | float | Final score |

### Frontend — `frontend/app/modules/imposter/[sessionId]/page.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│  THE IMPOSTER — Find the bug in the git history                  │
├──────────────┬──────────────────────────┬────────────────────── ┤
│  Team Panel  │  Commit Graph             │  Diff Viewer          │
│              │                           │                       │
│  🧑 Alice    │  ●─────●─────●─────●     │  commit d44e1f9       │
│  3 commits   │  |     |     |     |      │  Author: Carol Wu     │
│              │  A     B     C*    A      │                       │
│  🧑 Bob      │   (color = author)        │  --- models/user.py   │
│  2 commits   │                           │  +++ models/user.py   │
│              │  * = suspicious           │  @@ -5,7 +5,7 @@      │
│  🧑 Carol   │                           │  -    email: str      │
│  4 commits   │  [Filter by: All ▼]       │  +    email: Optional │
│              │                           │      [str] = None     │
├──────────────┴──────────────────────────┴───────────────────────┤
│  🔎 Report Imposter:                                              │
│  Teammate: [● Alice  ○ Bob  ● Carol]                             │
│  Commit: [d44e1f9 ▼ selected from graph]                         │
│  Resolution: [git revert ▼]                                      │
│                            [ 🚨 Submit Report ]                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Full Residency Run Mode

**Status:** Planned
**Concept:** Optional opt-in mode that chains all 5 phases into a single 2-hour cohesive session where context flows between phases.

### Context Chain

```
Phase 1 (The Difficult Client)
  └─► constraints_discovered + requirements → feeds into ↓

Phase 2 (The Code Crucible)
  └─► generated from Phase 1 requirements
  └─► student's final code → feeds into ↓

Phase 3 (The Bug Hunt)
  └─► bugs injected into the Phase 2 solution
  └─► fixed code → "deployed" → feeds into ↓

Phase 4 (The War Room)
  └─► emergency generated based on the deployed code context
  └─► resolution → story context for ↓

Phase 5 (The Imposter)
  └─► team simulation based on the complete project built in phases 1-4
```

### New Database Collection — `residency_runs`

| Field | Type | Description |
|-------|------|-------------|
| `run_id` | string | Unique ID |
| `user_id` | string | Student |
| `phase1_session_id` | string | |
| `phase2_session_id` | string | |
| `phase3_session_id` | string | |
| `phase4_session_id` | string | |
| `phase5_session_id` | string | |
| `total_score` | float | Sum of all 5 phase scores |
| `started_at` | datetime | |
| `completed_at` | datetime | |
| `status` | string | in_progress / completed / abandoned |

### API

```
POST /api/residency/start
  Response: { "run_id": "...", "phase1_session_id": "..." }
  → Creates residency_run record + starts Phase 1

POST /api/residency/{run_id}/advance
  Body: { "completed_session_id": "phase1_session_id" }
  Response: { "next_phase": 2, "next_session_id": "...", "context_carried": {...} }
  → Marks current phase complete, creates next phase session with carried context

GET /api/residency/{run_id}/status
  Response: { "current_phase": 3, "scores": {1: 85, 2: 72}, "total_so_far": 157 }
```

---

## 9. Database Schema (All Phases)

### Existing Collections (Phase 1)

| Collection | Key Fields |
|-----------|------------|
| `users` | user_id, name, email, auth_provider, global_score, role |
| `modules` | title, slug, description, difficulty_level, is_active |
| `scenarios` | module_id, title, truth_file (hidden), max_score, time_limit_seconds |
| `sessions` | user_id, scenario_id, status, final_score, preferences (JSON blob) |
| `chat_logs` | session_id, user_id, role, content, timestamp |
| `code_submissions` | session_id, language, code, exit_code, stdout, stderr |
| `evaluation_reports` | session_id, total_score, letter_grade, feedback, breakdown |

### New Collections (Phases 2–5)

| Collection | Phase | Key Fields |
|-----------|-------|------------|
| `coding_challenges` | 2 | session_id, task_description, test_cases (hidden), language |
| `bug_sessions` | 3 | session_id, buggy_code, bug_manifest (hidden), bugs_fixed, hints_used |
| `emergency_scenarios` | 4 | title, incident_type, broken_config, correct_root_cause (hidden), time_limit_seconds |
| `emergency_sessions` | 4 | session_id, scenario_id, commands_run, root_cause_submitted, time_used, score |
| `team_simulations` | 5 | session_id, team, imposter_name (hidden), git_history (hidden), student_report |
| `residency_runs` | All | user_id, phase1–5_session_ids, total_score, status |

**Config additions needed in `backend/app/config.py`:**
```python
coding_challenges_collection: str = "coding_challenges"
bug_sessions_collection: str = "bug_sessions"
emergency_scenarios_collection: str = "emergency_scenarios"
emergency_sessions_collection: str = "emergency_sessions"
team_simulations_collection: str = "team_simulations"
residency_runs_collection: str = "residency_runs"
```

---

## 10. Scoring System

All formulas live in `backend/app/scoring/engine.py`

| Phase | Module | Formula | Max Score |
|-------|--------|---------|-----------|
| 1 | The Difficult Client | `calculate_difficult_client_score()` ✅ | 100 |
| 2 | The Code Crucible | `calculate_code_crucible_score()` 🆕 | 100 |
| 3 | The Bug Hunt | `calculate_bug_hunt_score()` 🆕 | 110 → normalized to 100 |
| 4 | The War Room | `calculate_war_room_score()` ✅ (needs wiring) | 100 |
| 5 | The Imposter | `calculate_imposter_score()` ✅ (needs wiring) | 100 |

### Grade Thresholds (existing `score_to_grade()` in engine.py)

| Score | Grade |
|-------|-------|
| 95+ | A+ |
| 90+ | A |
| 85+ | B+ |
| 80+ | B |
| 75+ | C+ |
| 70+ | C |
| 60+ | D |
| < 60 | F |

---

## 11. New API Endpoints Reference

### Phase 2 — Code Crucible
```
POST /api/challenge/{session_id}/generate
POST /api/challenge/{session_id}/submit
```

### Phase 3 — Bug Hunt
```
POST /api/bugs/{session_id}/start
POST /api/bugs/{session_id}/submit
GET  /api/bugs/{session_id}/hint
```

### Phase 4 — War Room
```
POST /api/emergency/{session_id}/start
POST /api/emergency/{session_id}/command
POST /api/emergency/{session_id}/resolve
WS   /ws/emergency/{session_id}
```

### Phase 5 — The Imposter
```
POST /api/imposter/{session_id}/start
POST /api/imposter/{session_id}/report
GET  /api/imposter/{session_id}/teammates
```

### Residency Run
```
POST /api/residency/start
POST /api/residency/{run_id}/advance
GET  /api/residency/{run_id}/status
```

---

## 12. New Backend File Structure

```
backend/app/
├── agents/
│   ├── dual_agent.py                  ✅ Phase 1 agents (Director, Actor, Evaluator)
│   ├── coding_challenge_agent.py      🆕 Phase 2 (ChallengeGeneratorAgent, OutputValidatorAgent)
│   ├── bug_injector_agent.py          🆕 Phase 3 (BugInjectorAgent, BugEvaluatorAgent)
│   ├── emergency_agent.py             🆕 Phase 4 (EmergencyDirectorAgent, EmergencyEvaluatorAgent)
│   └── imposter_agent.py              🆕 Phase 5 (WorkDividerAgent, TeamCodeGenAgent, ImposterAgent, ForensicsEvaluatorAgent)
│
├── routers/
│   ├── auth.py                        ✅ JWT validation
│   ├── chat.py                        ✅ Phase 1 chat endpoints
│   ├── modules.py                     ✅ Module/scenario listing
│   ├── scenarios.py                   ✅ Session start + code execute
│   ├── eval.py                        ✅ Phase 1 evaluation
│   ├── users.py                       ✅ User profile + leaderboard
│   ├── coding_challenge.py            🆕 Phase 2 endpoints
│   ├── bug_hunt.py                    🆕 Phase 3 endpoints
│   ├── emergency.py                   🆕 Phase 4 endpoints + WebSocket
│   ├── imposter.py                    🆕 Phase 5 endpoints
│   └── residency.py                   🆕 Full Residency Run endpoints
│
└── scoring/
    └── engine.py                      ✅ Phase 1 + War Room + Imposter formulas
                                       🆕 Add: calculate_code_crucible_score()
                                       🆕 Add: calculate_bug_hunt_score()
```

---

## 13. New Frontend Pages

```
frontend/app/modules/
├── difficult-client/                  ✅ Full game UI (Phase 1)
│   └── [[...sessionId]]/page.tsx
│
├── code-crucible/                     🆕 Phase 2
│   └── [sessionId]/page.tsx           Monaco editor + challenge + terminal
│
├── bug-hunt/                          🆕 Phase 3
│   └── [sessionId]/page.tsx           Monaco + bug tracker + terminal
│
├── war-room/                          🔄 Expand stub (Phase 4)
│   └── [sessionId]/page.tsx           Timer + CTO chat + terminal + config editor
│
└── imposter/                          🔄 Expand stub (Phase 5)
    └── [sessionId]/page.tsx           Team panel + commit graph + diff viewer + report form
```

New component files needed:
```
frontend/components/
├── CommitGraph.tsx                    🆕 D3/CSS commit tree, click → diff view
├── DiffViewer.tsx                     🆕 Syntax-highlighted diff display
├── CountdownTimer.tsx                 🆕 Server-synced countdown with color states
├── BugTracker.tsx                     🆕 Lock/unlock icons for bug progress
└── CTOChat.tsx                        🆕 Scrolling urgent message feed
```

---

## 14. Implementation Sequence

Recommended build order to maintain a always-playable state:

1. **Phase 2 (The Code Crucible)** — Extends existing sandbox + Monaco, minimal new infrastructure
2. **Phase 3 (The Bug Hunt)** — Reuses Phase 2's code execution loop, adds `BugInjectorAgent`
3. **Phase 4 (The War Room)** — Introduces WebSocket timer + new UI layout
4. **Phase 5 (The Imposter)** — Most complex new frontend (commit graph), but backend is straightforward
5. **Residency Run** — Glue layer connecting all 5, built last when all phases are complete

For each phase:
- [ ] Write agent(s) in `backend/app/agents/`
- [ ] Add scoring formula(s) to `backend/app/scoring/engine.py`
- [ ] Create router in `backend/app/routers/`
- [ ] Register router in `backend/app/main.py`
- [ ] Add collection ID constants to `backend/app/config.py`
- [ ] Add collection to `backend/scripts/setup_db.py`
- [ ] Build frontend page
- [ ] Build any new reusable components
- [ ] End-to-end test the full phase flow

---

*This document reflects the planned architecture as of March 2026. Implementation details may be refined during development.*
