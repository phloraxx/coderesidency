# CodeResidency

### The Clinical Rotation Simulator for Software Engineers

> *"Medical students spend years in hospitals treating real patients before they're allowed to practice independently. Why do we let CS graduates walk into a production codebase on Day 1 with nothing but algorithms and syntax?"*

[![Phase 1](https://img.shields.io/badge/Phase%201-The%20Difficult%20Client-success)](./ARCHITECTURE.md#3-phase-1--the-difficult-client)
[![Phase 2](https://img.shields.io/badge/Phase%202-The%20Code%20Crucible-yellow)](./ARCHITECTURE.md#4-phase-2--the-code-crucible)
[![Phase 3](https://img.shields.io/badge/Phase%203-The%20Bug%20Hunt-yellow)](./ARCHITECTURE.md#5-phase-3--the-bug-hunt)
[![Phase 4](https://img.shields.io/badge/Phase%204-The%20War%20Room-yellow)](./ARCHITECTURE.md#6-phase-4--the-war-room)
[![Phase 5](https://img.shields.io/badge/Phase%205-The%20Imposter-yellow)](./ARCHITECTURE.md#7-phase-5--the-imposter)

---

## What Is CodeResidency?

CodeResidency is a simulation platform where computer science students face the real-world challenges of software engineering — not as homework, but as live, high-stakes-feeling simulations with no real-world consequences.

**The medical analogy:** Before a student doctor can see patients alone, they complete supervised clinical rotations — rotating through ER, surgery, psychiatry, and pediatrics to build reflexes that no textbook can teach. CodeResidency gives CS students the same experience:

- Rotating through **The Difficult Client** to learn requirements engineering
- Rotating through **The Code Crucible** to implement under real-world constraints
- Rotating through **The Bug Hunt** to build debugging reflexes
- Rotating through **The War Room** to handle production emergencies
- Rotating through **The Imposter** to practice git forensics on a sabotaged team

Each simulation is powered by AI that plays the role of the client, the CTO, the teammates — and the grader.

**Institution:** MuLearn SCET

---

## The 5 Simulation Phases

Each phase can be played independently. An optional **Full Residency Run** chains all 5 into a cohesive 2-hour simulation where context flows between phases.

---

### Phase 1 — The Difficult Client ✅ Complete

**Skill:** Requirements elicitation, client communication, empathy

**The Situation:** You've been hired as a freelance developer. Your client is vague, non-technical, and occasionally difficult. They know what they want — but can't articulate it in technical terms. Your job: figure out exactly what they need before writing a single line of code.

**How it works:**
- An AI client is generated with a hidden "Truth File" — 4–6 critical constraints the client holds (budget, deadline, technical requirements, accessibility needs)
- A **Director AI** (hidden) evaluates the quality of every question you ask. Rude or jargon-heavy questions get minimal information. Empathetic, clear questions unlock more
- An **Actor AI** (visible) plays the client in character — stays in persona, reveals only what the Director permits
- When 80%+ of constraints are discovered, a coding challenge unlocks
- Session ends with an AI-generated report card: letter grade, communication breakdown, and specific feedback

**Example scenarios:**
- "Angry Bakery Owner" — Needs a website but refuses to pay for hosting
- "Overwhelmed Non-Profit Director" — Wants an app with a $0 budget
- "Perfectionist Startup Founder" — Keeps changing requirements mid-conversation

**What gets scored:**

| Component | Weight |
|-----------|--------|
| Constraints discovered | 40% |
| Question quality (empathy, clarity, no jargon) | 20% |
| Code correctness | 25% |
| Code quality | 15% |

---

### Phase 2 — The Code Crucible 🏗 Planned

**Skill:** Requirement-driven implementation, output validation, code quality

**The Situation:** The requirements gathering is done. Time to build it. But this isn't a practice problem — the task comes directly from what the client told you. If you gathered the wrong requirements in Phase 1, you might build the wrong thing.

**How it works:**
- A **ChallengeGeneratorAgent** reads your discovered requirements and generates a specific coding task: function signature, expected inputs/outputs, and hidden test cases
- You implement the solution in Monaco editor (Python/JavaScript/Java)
- "Run" executes your code in an isolated Docker sandbox and shows the output
- "Submit" runs all hidden test cases and scores against expected output
- An **OutputValidatorAgent** reviews both correctness and code quality

**Example:**
After discovering the bakery owner needs offline-capable receipt generation with no paid libraries → challenge: *"Write a function that generates a plain-text receipt from a list of items and prices."*

**What gets scored:**

| Component | Weight |
|-----------|--------|
| Test case pass rate | 50% |
| Code quality (naming, structure, readability) | 30% |
| Efficiency (time taken, solution brevity) | 20% |

---

### Phase 3 — The Bug Hunt 🏗 Planned

**Skill:** Debugging, error reading, code correction under constraint

**The Situation:** Someone handed you a codebase. It's broken in exactly 4 ways — one syntax error, one logic error, one runtime error, one type error. The terminal is your only guide. Fix them all.

**How it works:**
- A **BugInjectorAgent** takes a correct solution and injects exactly 4 intentional bugs, one of each type — stored server-side in a secret bug manifest you never see
- The buggy code is pre-loaded into your Monaco editor
- Click "Run" → Docker runs it → you read the error messages
- Fix the errors, then "Submit" — a **BugEvaluatorAgent** checks which bugs were resolved
- Score is progressive: each bug fixed earns 25 pts regardless of order
- Up to 3 submissions. Need a nudge? Request a hint (reveals line number, costs -10 pts)

**The four bug types:**

| Type | Example |
|------|---------|
| SyntaxError | Missing `:` after `def`, unclosed bracket |
| LogicError | `totalAmount == 0` instead of `= 0` |
| RuntimeError | Division by zero, index out of range |
| TypeError | Concatenating `str` + `int` without conversion |

**What gets scored:**

| Component | Weight |
|-----------|--------|
| Per bug fixed | 25 pts each (×4) |
| Hint penalty | -10 pts per hint used |
| Efficiency bonus | +10 pts if all 4 fixed within 3 submissions |

---

### Phase 4 — The War Room 🏗 Planned

**Skill:** Production incident response, root cause analysis, composure under pressure

**The Situation:** It's 2:47 AM. Your phone buzzes. Slack is on fire. All users are getting 404s. The CTO is messaging you. You have 15 minutes.

**How it works:**
- An emergency scenario is loaded: a pre-seeded broken environment with a specific fault
- A **WebSocket countdown timer** runs server-side — the server enforces the deadline regardless of client state
- An **EmergencyDirectorAgent** sends escalating pressure messages via a live CTO chat feed:
  - 80% time left: *"Getting some reports of weirdness, can you take a look?"*
  - 50% time left: *"Users are hitting errors! Error rate is at 40%!"*
  - 10% time left: *"WE ARE LOSING $500/MINUTE. FIX IT OR I'M ROLLING BACK THE RELEASE."*
- You can run terminal commands, edit config files, and submit a root cause explanation
- The AI scores your diagnosis and fix quality after submission

**Emergency types:**

| Incident | Symptom |
|----------|---------|
| 404 all customers | Misconfigured route prefix |
| Database connection failure | Wrong connection string after deploy |
| Wrong deployment | Backwards-incompatible API change |
| Memory leak | Server crashing every 10 minutes |
| Security breach alert | Unauthorized admin access in logs |

**What gets scored:**

| Component | Weight |
|-----------|--------|
| Correct root cause identified | 30% |
| Fix quality (proper fix vs. brute-force restart) | 20% |
| Time efficiency | 35% |
| Systematic approach | 15% |

---

### Phase 5 — The Imposter 🏗 Planned

**Skill:** Code review, git forensics, team debugging, identifying bad actors

**The Situation:** Your team of 4 just finished a feature. It worked in staging. Now it's broken in production. Someone introduced a bug — and they're blaming each other. You need to find the commit that broke everything and call out the imposter.

**How it works:**
- Three AI teammates (**Alice**, **Bob**, **Carol**) each have a distinct coding style and commit history
- An **ImposterAgent** secretly authors one "sabotage commit" — a change that looks legitimate but introduces a subtle bug
- You get access to a **visual, interactive git commit graph** — click any commit to see its full diff (syntax-highlighted, added/removed lines)
- Filter commits by author, trace the bug back to its source
- Submit your report: which teammate is the imposter + which commit caused the bug + how you'd resolve it

**The visual git experience:**
```
● a3f8b2c  Alice Chen     "feat: add payment processing"
● b91c44a  Bob Martinez   "fix: auth middleware null check"
● d44e1f9  Carol Wu       "fix: update user schema"   ← click to see diff
● 8ab901f  You            "feat: implement dashboard"
```
Click any node to see the diff. The bad commit's diff looks plausible. That's the point.

**Resolution methods (scored differently):**

| Method | Points |
|--------|--------|
| `git revert <commit>` | 30 pts — clean, safe, industry standard |
| Manual fix | 5 pts — works but history is muddy |
| `git reset --soft` | 15 pts — functional but risky |
| `git push --force` | -50 pts — destroys shared history, never do this |

**What gets scored:**

| Component | Weight |
|-----------|--------|
| Correct imposter identified | 35% |
| Correct commit identified | 20% |
| Resolution method | 30% |
| Time efficiency | 15% |

---

## Tech Stack

### Backend

| Component | Technology |
|-----------|------------|
| Framework | FastAPI 0.111+ (Python 3.11) |
| AI / LLM | Google Gemini 2.5 Flash Lite via LangChain |
| Agent Orchestration | LangChain + LangGraph |
| Database + Auth | Appwrite 1.8+ |
| Code Execution | Docker SDK — ephemeral sandboxed containers |
| Caching | Redis |
| Real-time | FastAPI native WebSockets |
| Config | Pydantic-settings |

### Frontend

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Appwrite Client SDK (Google + GitHub OAuth) |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| State | Zustand |
| HTTP Client | Axios with JWT interceptor |
| Design System | Google Material-inspired (CSS variables) |
| Fonts | Outfit, Roboto, JetBrains Mono |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Orchestration | Docker Compose |
| Ports | Frontend: 3000, Backend: 8000 |
| Auth Provider | Appwrite |

---

## Architecture Overview

### The Director / Actor / Evaluator Pattern

Every AI-driven simulation phase uses the same 3-agent architecture:

```
Student Input
     │
     ▼
  DIRECTOR (Hidden)
  ├── Sees the truth file (hidden ground truth)
  ├── Scores the student's action quality
  ├── Decides how much information to reveal
  └── Writes an instruction for the Actor
     │
     │ actor_instruction
     ▼
  ACTOR (Visible)
  ├── Plays the role (client / CTO / teammate)
  ├── Responds in character
  └── Reveals only what the Director permits
     │
     │ visible response
     ▼
Student sees response + score feedback

[Session ends]
     ▼
  EVALUATOR (Runs once)
  ├── Reads full history + truth file
  └── Generates: letter grade, strengths, areas for improvement, detailed breakdown
```

### The Truth File Principle

Every simulation has a **hidden ground truth** stored server-side — never sent to the client. This is the source of all scoring: complete client requirements, bug locations, imposter identity. Students must earn information through the simulation itself.

### Secure Code Execution

All student code runs in ephemeral Docker containers with: no network access, read-only filesystem, non-root user, 256MB memory limit, 50 PID limit, 30-second execution timeout, no Linux capabilities.

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)
- [Python 3.11+](https://www.python.org/)
- An [Appwrite](https://appwrite.io/) instance (self-hosted or cloud)
- A [Google AI Studio](https://aistudio.google.com/) API key (for Gemini)

### 1. Clone and Configure

```bash
git clone https://github.com/your-org/coderesidency.git
cd coderesidency
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Fill in your credentials:

```env
# backend/.env
GEMINI_API_KEY=your_google_ai_studio_key
APPWRITE_ENDPOINT=https://your-appwrite-instance/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key
REDIS_URL=redis://redis:6379
```

```env
# frontend/.env.local
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-instance/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Set Up the Database

```bash
cd backend
pip install -r requirements.txt
python scripts/setup_db.py
```

### 3. Start the Application

```bash
make dev
# or: docker-compose up --build
```

- Frontend: `http://localhost:3000`
- API Docs: `http://localhost:8000/docs`

---

## Adding a New Scenario (Phase 1)

Create a scenario in Appwrite's `scenarios` collection with a `truth_file` JSON:

```json
{
  "persona": {
    "name": "Marcus",
    "role": "Restaurant Owner",
    "personality": "Impatient, non-technical, budget-obsessed",
    "speaking_style": "Short sentences. Gets frustrated with jargon.",
    "greeting": "Finally! I've been waiting. I need an app. Make it quick."
  },
  "constraints": [
    {
      "id": "budget",
      "description": "Maximum budget is $200 total including hosting",
      "reveal_triggers": ["budget", "cost", "price", "afford", "money"],
      "partial_hint": "I'm not made of money.",
      "full_reveal": "I can spend two hundred dollars. That's it. Final."
    },
    {
      "id": "must_work_offline",
      "description": "App must work without internet — unreliable WiFi",
      "reveal_triggers": ["internet", "wifi", "online", "offline", "connection"],
      "partial_hint": "Our WiFi is... not the best.",
      "full_reveal": "The WiFi cuts out every Friday night. Whatever you build has to work without it."
    }
  ]
}
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete truth file schema.

---

## API Reference

Full interactive docs: `http://localhost:8000/docs`

### Key Endpoints

#### Start a Session
```http
POST /api/scenarios/{scenario_id}/start
Authorization: Bearer <jwt>
```

#### Send a Chat Message
```http
POST /api/chat/send
Authorization: Bearer <jwt>
{ "session_id": "abc123", "message": "Could you tell me about your budget?" }
```

#### Execute Code
```http
POST /api/execute
Authorization: Bearer <jwt>
{ "session_id": "abc123", "language": "python", "code": "print('hello')" }
```

#### Generate Evaluation Report
```http
POST /api/evaluation/{session_id}/generate
Authorization: Bearer <jwt>
```

---

## Scoring System

| Phase | Module | Max Score | Formula Components |
|-------|--------|-----------|-------------------|
| 1 | The Difficult Client | 100 | Discovery 40% + Communication 20% + Code 40% |
| 2 | The Code Crucible | 100 | Test Cases 50% + Quality 30% + Efficiency 20% |
| 3 | The Bug Hunt | 100 | 25 pts/bug − 10 pts/hint + efficiency bonus |
| 4 | The War Room | 100 | Base 1000 − time penalty + diagnosis bonus |
| 5 | The Imposter | 100 | Identification 55% + Resolution 30% + Time 15% |

**Grade scale:** `A+ (95+)` `A (90+)` `B+ (85+)` `B (80+)` `C+ (75+)` `C (70+)` `D (60+)` `F (<60)`

---

## Project Structure

```
codeResidency/
├── README.md                        ← This file
├── ARCHITECTURE.md                  ← Full technical design document (all 5 phases)
├── docker-compose.yml
├── Makefile
│
├── backend/app/
│   ├── agents/
│   │   ├── dual_agent.py            ← Phase 1 (complete)
│   │   ├── coding_challenge_agent.py  ← Phase 2 (planned)
│   │   ├── bug_injector_agent.py      ← Phase 3 (planned)
│   │   ├── emergency_agent.py         ← Phase 4 (planned)
│   │   └── imposter_agent.py          ← Phase 5 (planned)
│   ├── routers/                     ← API endpoints per phase
│   ├── scoring/engine.py            ← All scoring formulas
│   └── docker_manager/sandbox.py    ← Secure code execution
│
└── frontend/app/
    ├── modules/
    │   ├── difficult-client/        ← Phase 1 (complete)
    │   ├── code-crucible/           ← Phase 2 (planned)
    │   ├── bug-hunt/                ← Phase 3 (planned)
    │   ├── war-room/                ← Phase 4 (stub)
    │   └── imposter/                ← Phase 5 (stub)
    ├── dashboard/
    ├── leaderboard/
    └── evaluation/
```

---

## Roadmap

| Phase | Module | Status |
|-------|--------|--------|
| 1 | The Difficult Client | ✅ Complete |
| 2 | The Code Crucible | 🏗 Next |
| 3 | The Bug Hunt | 🏗 Planned |
| 4 | The War Room | 🏗 Planned (stub exists) |
| 5 | The Imposter | 🏗 Planned (stub exists) |
| — | Full Residency Run | 🔮 Future |
| — | Instructor Dashboard | 🔮 Future |
| — | Custom Scenario Builder | 🔮 Future |

---

## Contributing

```bash
# Branch naming
feature/phase2-code-crucible
fix/war-room-timer-websocket
docs/update-architecture

# Start dev environment
make dev

# Backend-only (faster iteration)
cd backend && uvicorn app.main:app --reload --port 8000
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full implementation specification for each phase.

---

## Team

**MuLearn SCET** — CodeResidency is developed as a capstone project at Sarvajanik College of Engineering and Technology, in collaboration with the MuLearn community.

---

*CodeResidency — because the gap between university and Day 1 should be training, not trauma.*
