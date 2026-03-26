# AGENTS.md — MyGrimoria

> Developer guide for MyGrimoria mystical oracle app. Integrates SDD methodology.

---

## Project Overview

Mystical oracle application providing I Ching, Tarot, and Runes divination with AI interpretations.

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite + TailwindCSS 4 |
| Backend | Python FastAPI + Supabase |
| Auth | Supabase Auth |
| AI | DeepSeek (OpenAI-compatible API) |

---

## Commands

### Frontend
```bash
npm run dev          # Dev server (port 3000, host 0.0.0.0)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # TypeScript type-check (tsc --noEmit)
npm run clean        # Remove dist/
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py       # or: uvicorn main:app --reload --port 8000
```

---

## Environment Variables

### Frontend (`VITE_*` — exposed to browser)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
VITE_WP_GRAPHQL_URL=https://yourdomain.com/graphql
```

### Backend (server-side only)
```env
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com

# AI Provider (DeepSeek — OpenAI-compatible)
DEEPSEEK_API_KEY=your-deepseek-api-key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

> **Never commit real secrets.** Copy `.env.example` → `.env` and fill in values locally.

---

# SDD Pipeline — Agents System

```
[TRIGGER] → [INTAKE] → [SPEC] → [DESIGN] → [DEV] → [REVIEW] → [MERGED]
```

## Agent Phases

| Phase | Agent | Output |
|-------|-------|--------|
| Intake | PM Agent | Validated request |
| Pre-spec | Socratic Agent | Disambiguated requirements |
| Spec | Spec Agent | `/specs/<domain>/<feature>.spec.md` |
| Design | Design Agent | `/docs/architecture/<feature>.design.md` |
| Dev | Backend/Frontend Dev | Code implementation |
| Review | Review Agent | Approved PR |
| Post-merge | Data + Marketing | Instrumentation + content |

---

## PM Agent (Product Manager)

**Responsibilities:**
- Define product goals
- Maintain prioritized backlog
- Approve features into pipeline
- Close feedback loop with analytics

**RICE Scoring:**
```
RICE = (Reach × Impact × Confidence) / Effort
```
- Reach: Users affected per quarter
- Impact: 3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal
- Confidence: 100%=high, 80%=medium, 50%=low
- Effort: Person-weeks

**Decisions:**
| Decision | Meaning |
|----------|---------|
| `APPROVED` | Enter pipeline |
| `DEFERRED` | Valid but not now |
| `REJECTED` | Not built |

---

## Socratic Agent

**Principles:**
1. Never assert, always ask — identify what you don't know
2. Deep-level questions — not the obvious, what's beneath the obvious
3. Detect contradictions — name them directly
4. Separate facts from assumptions — unvalidated assumptions block progress
5. Timeboxing — max 3 rounds per session

**Activation:**
- Pre-spec: Validate requirements before writing
- Pre-design: Validate technical assumptions
- On-demand: Any agent can invoke for ambiguity

**Output:**
- Session documented with Q&A
- Assumptions marked as `[assumption]`
- Gaps requiring human input marked as `[human-required]`

---

## Spec Agent

**Input:** Free-form requirement
**Output:** `/specs/<domain>/<feature>.spec.md` (status: draft)

**Responsibilities:**
- Extract FR (Functional Requirements) and NFR (Non-Functional)
- Identify actors, use cases, acceptance criteria (Given/When/Then)
- Flag ambiguities
- Define scope boundary

**Must NOT:**
- Make architectural decisions
- Write code

**States:** `draft` → `socratic-review` → `approved`

---

## Design Agent

**Input:** Spec `status: approved`
**Output:** `/docs/architecture/<feature>.design.md`

**Responsibilities:**
- Define API endpoints and request/response schemas
- Define frontend component tree
- Define TypeScript interfaces
- Define DB schema and migrations
- Cross-cutting: auth, error handling, caching, observability

**Must NOT:**
- Implement code
- Deviate from spec requirements

**States:** `draft` → `socratic-review` → `ready-for-dev`

---

## Dev Agent (Backend + Frontend)

**Backend:**
- Input: Design doc `status: ready-for-dev` + OpenAPI contract
- Output: Code in `/backend`

**Frontend:**
- Input: Design doc + UI spec + OpenAPI contract
- Output: Code in `/src`

**Modes:**
- **simple**: Component + State in one file
- **full**: UI Spec → Design System → Component → State

**Constraints:**
- Do not invent requirements
- Do not introduce dependencies without ADR
- Follow project conventions (see Code Style Guidelines below)

**States:** `not-started` → `in-progress` → `pr-opened` → `done`

---

## Review Agent

**Input:** PR url + spec + design doc + contract + test results
**Output:** Approval or changes required

**Checklist:**
- [ ] Code follows spec and design
- [ ] Tests pass
- [ ] Lint passes (`npm run lint` / `mypy`)
- [ ] No breaking changes without ADR
- [ ] Tracking instrumentation present
- [ ] Environment variables documented in `.env.example`

**Decisions:**
| Decision | Action |
|----------|--------|
| ✅ Approved | Direct merge |
| ❌ Changes required | Dev retry (max 3) |
| ⚠️ Breaking change | Human gate |

---

## Data/Analytics Agent

**Instrumentation:**
- Input: Approved spec + tracking plan + OpenAPI contract
- Output: Updated tracking plan + typed events

**Event Model:**
```typescript
// Naming: <entity>_<past_verb>
// Examples: reading_created, export_completed, session_started

// Base schema
{
  timestamp: number,    // Unix ms
  session_id: string,   // UUID
  user_id: string,      // Anonymized
  user_role: RoleEnum,
  platform: PlatformEnum
}
```

---

## Marketing Agent

**Copy Agent:**
- Input: UI spec + spec + domain glossary
- Output: UI strings inventory in `/content/copy/`

**Release Agent:**
- Input: Changelog + merged specs
- Output: Release notes, announcements

**SEO Agent:**
- Input: Approved spec + validated AC
- Output: SEO pages, FAQs, user docs

**Principles:**
- No inventing — all content traceable to SDD artifacts
- Clear before clever
- Subject is the user, not the product
- No filler words

---

# Code Style Guidelines

## TypeScript

### Imports
- Use `@/` alias (configured in `tsconfig.json`)
- Group: external first, then internal
- Use `import { type X }` for type-only imports

```typescript
// Good
import React from 'react';
import { useState, useEffect } from 'react';
import { useOracle } from '@/hooks/useOracle';
import type { Reading } from '@/types';
```

### Naming
- Components: PascalCase (`HexagramDetail`, `LoginPage`)
- Hooks: `use` prefix (`useOracle`, `useOracleSession`)
- Types/Interfaces: PascalCase (`Reading`, `TarotReading`)
- Files: kebab-case for components, camelCase for utilities

### React Patterns
```typescript
interface Props {
  title: string;
  onComplete?: () => void;
}

export function HexagramDetail({ title, onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // effect logic
  }, []);

  return <div className="hexagram-detail">{/* JSX */}</div>;
}
```

### Error Handling
```typescript
try {
  const { data, error } = await supabase.from('readings').select('*');
  if (error) throw error;
  return data;
} catch (err) {
  console.error('Failed to fetch readings:', err);
  return [];
}
```

---

## Python (Backend)

### Style
- Follow PEP 8
- Type hints on all function signatures
- Docstrings for public functions and classes

### FastAPI Patterns
```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/readings", tags=["readings"])

class ReadingRequest(BaseModel):
    oracle_type: str
    seed: int | None = None

@router.post("/", response_model=ReadingResponse)
async def create_reading(
    body: ReadingRequest,
    current_user: dict = Depends(get_current_user),
) -> ReadingResponse:
    """Create a new oracle reading for the authenticated user."""
    ...
```

### Error Handling
```python
from fastapi import HTTPException

# Raise typed HTTP errors — never return raw exceptions
raise HTTPException(status_code=404, detail="Reading not found")
```

---

## Project Structure

```
mygrimoria/
├── src/
│   ├── App.tsx              # Routes
│   ├── main.tsx             # App entry point
│   ├── index.css            # Tailwind base styles
│   ├── vite-env.d.ts        # Vite type declarations
│   ├── assets/              # Static assets (images, fonts)
│   ├── components/          # Shared UI components
│   │   ├── Auth/            # ProtectedRoute
│   │   ├── Layout/          # Header, Footer, Layout wrapper
│   │   ├── HexagramDetail.tsx
│   │   ├── HexagramDisplay.tsx
│   │   ├── HexagramLine.tsx
│   │   ├── RuneDetail.tsx
│   │   ├── TarotDetail.tsx
│   │   ├── LoadingOracle.tsx
│   │   └── Typewriter.tsx
│   ├── pages/               # Route-level pages
│   │   ├── Home/
│   │   ├── Blog/
│   │   ├── Iching/
│   │   ├── Tarot/
│   │   ├── Runes/
│   │   ├── Oracle/
│   │   ├── Sanctum/         # User's spellbook & profile
│   │   └── Login/
│   ├── hooks/               # useOracle, useOracleSession
│   ├── context/             # AuthContext, ThemeContext
│   ├── services/            # api.ts (FastAPI), wpService.ts (WordPress)
│   ├── lib/                 # supabase.ts client
│   ├── constants/           # Oracle data (tarot, runes, iching)
│   └── types/               # Global TypeScript types
├── backend/
│   ├── main.py              # FastAPI app + routes
│   ├── auth.py              # JWT / Supabase auth logic
│   ├── models.py            # Pydantic + DB models
│   ├── database.py          # DB connection (Supabase)
│   ├── constants/           # Backend oracle data
│   └── alembic/             # DB migrations
├── specs/                   # Feature specifications (SDD)
│   └── <domain>/<feature>.spec.md
├── docs/
│   └── architecture/        # Feature design docs (SDD)
│       └── <feature>.design.md
├── stitch/                  # UI design prototypes / mockups
├── .env.example             # Required env variables template
├── AGENTS.md                # This file
├── SKILLS.md                # Executable agent skills
└── ROADMAP.md               # Project roadmap
```

---

## Development Workflow (SDD)

1. **Intake**: PM validates and prioritizes request via RICE score
2. **Socratic**: Clarify requirements, surface assumptions
3. **Spec**: Write feature specification → `/specs/<domain>/<feature>.spec.md`
4. **Design**: Define technical architecture → `/docs/architecture/<feature>.design.md`
5. **Dev**: Implement code following design doc
6. **Review**: Validate against spec + design checklist
7. **Merge**: Deploy to production

---

## Adding New Features

1. Create spec in `/specs/<domain>/<feature>.spec.md`
2. Create design in `/docs/architecture/<feature>.design.md`
3. Implement in `/src/pages/` (frontend) or `/backend/` (backend)
4. Add route in `App.tsx`
5. Use `ProtectedRoute` for auth-required pages
6. Document new env variables in `.env.example`