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
| AI | Gemini API |

---

## Commands

### Frontend
```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # TypeScript check
npm run clean        # Remove dist
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py       # or: uvicorn main:app --reload --port 8000
```

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
- Assumptions marked as `assumptions`
- Gaps marked as `[human-required]`

---

## Spec Agent

**Input:** Free-form requirement
**Output:** `/specs/<domain>/<feature>.spec.md` (status: draft)

**Responsibilities:**
- Extract FR (Functional Requirements) and NFR (Non-Functional)
- Identify actors, use cases, acceptance criteria
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
- Define API endpoints
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
- Follow project conventions

**States:** `not-started` → `in-progress` → `pr-opened` → `done`

---

## Review Agent

**Input:** PR url + spec + design doc + contract + test results
**Output:** Approval or changes required

**Checklist:**
- [ ] Code follows spec and design
- [ ] Tests pass
- [ ] Lint passes
- [ ] No breaking changes without ADR
- [ ] Tracking instrumentation present
- [ ] Environment variables documented

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
// <entity>_<past_verb>
feature_created, export_completed, search_performed

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
- Output: UI strings inventory

**Release Agent:**
- Input: Changelog + merged specs
- Output: Release notes, announcements

**SEO Agent:**
- Input: Approved spec + validated AC
- Output: SEO pages, FAQs, user docs

**Principles:**
- No inventing — all content traceable to SDD artifacts
- Clear before clever
- Subject is the user
- No filler

---

# Code Style Guidelines

## TypeScript

### Imports
- Use `@/` alias (configured in tsconfig.json)
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
- Types: PascalCase (`Reading`, `TarotReading`)
- Files: kebab-case components, camelCase utilities

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

## Error Handling
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

## Project Structure

```
mygrimoria/
├── src/
│   ├── App.tsx              # Routes
│   ├── main.tsx             # Entry
│   ├── index.css            # Tailwind
│   ├── components/         # UI components
│   │   ├── Auth/           # Auth (ProtectedRoute)
│   │   └── Layout/         # Layout (Header, Footer, Layout)
│   ├── pages/              # Route pages
│   │   ├── Home/
│   │   ├── Blog/
│   │   ├── Iching/
│   │   ├── Tarot/
│   │   ├── Runes/
│   │   ├── Oracle/
│   │   ├── Grimorio/
│   │   ├── Sanctum/
│   │   └── Login/
│   ├── hooks/              # Custom hooks (useOracle, useOracleSession)
│   ├── context/            # Context (Auth, Theme)
│   ├── services/           # API (api.ts, wpService.ts)
│   ├── lib/                # Utils (supabase.ts)
│   ├── constants/          # Oracle data (tarot, runes, iching)
│   └── types/              # TypeScript types
├── backend/
│   ├── main.py             # FastAPI entry
│   ├── auth.py             # Auth logic
│   ├── models.py           # DB models
│   ├── database.py         # DB connection
│   ├── constants/          # Backend data
│   └── alembic/            # Migrations
├── stitch/                 # Design prototypes
└── AGENTS.md              # This file
```

---

## Development Workflow (SDD)

1. **Intake**: PM validates and prioritizes request
2. **Socratic**: Clarify requirements, identify assumptions
3. **Spec**: Write feature specification
4. **Design**: Technical architecture
5. **Dev**: Implement code
6. **Review**: Validate against spec
7. **Merge**: Deploy to production

---

## Adding New Features

1. Create spec in `/specs/<domain>/<feature>.spec.md`
2. Create design in `/docs/architecture/<feature>.design.md`
3. Implement in `/src/pages/` (frontend) or `/backend/` (backend)
4. Add route in `App.tsx`
5. Use `ProtectedRoute` for auth-required pages

---

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
DEEPSEEK_API_KEY=your_deepseek_key
```