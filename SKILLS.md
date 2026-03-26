# SKILLS.md — MyGrimoria

> Executable skills for LLM agents. Reference each skill by its section header.

---

## Index

| Skill | Agent | Phase |
|-------|-------|-------|
| [rice-scoring](#rice-scoring) | PM | Intake |
| [backlog-management](#backlog-management) | PM | Intake |
| [socratic-question](#socratic-question) | Socratic | Pre-spec / Pre-design |
| [spec-writing](#spec-writing) | Spec | Spec |
| [design-doc](#design-doc) | Design | Design |
| [frontend-implementation](#frontend-implementation) | Dev | Dev |
| [backend-implementation](#backend-implementation) | Dev | Dev |
| [code-review](#code-review) | Review | Review |
| [event-schema](#event-schema) | Data | Post-merge |
| [tracking-plan](#tracking-plan) | Data | Post-merge |
| [voice-and-tone](#voice-and-tone) | Marketing | Post-merge |
| [ui-copy](#ui-copy) | Marketing | Post-merge |
| [release-notes](#release-notes) | Marketing | Post-merge |

---

## PM Skills

### rice-scoring

**Trigger:** New feature request arrives (via user message or backlog review)

**Input:**
- `requirement` (string, required): Feature description
- `okrs_current` (string, optional): Current OKRs for alignment check
- `analytics_data` (string, optional): Usage data for Reach estimation

**Steps:**
1. Estimate Reach (unique users affected per quarter)
2. Estimate Impact (0.25 / 0.5 / 1 / 2 / 3)
3. Estimate Confidence (100% / 80% / 50%)
4. Estimate Effort (person-weeks)
5. Calculate: `RICE = (Reach × Impact × Confidence) / Effort`
6. Compare score with top-5 backlog items
7. Emit decision: `APPROVED` / `DEFERRED` / `REJECTED` with justification

**Output:** Backlog entry with RICE score and decision

**On failure:**
- If Reach or Impact cannot be estimated → mark as `[assumption]` and proceed with conservative values
- If RICE score ties with existing backlog item → escalate to PM for manual priority

---

### backlog-management

**Trigger:** `event_type` = `new_request` | `analytics_report` | `periodic_review`

**Input:**
- `event_type` (enum, required): Type of trigger event

**Steps:**
1. Classify request (feature / bug / chore / spike)
2. Execute `rice-scoring` skill
3. Detect duplicates against existing backlog
4. Reorder backlog by RICE score descending
5. Archive rejected items older than 90 days

**Output:** `backlog.md` updated

**On failure:**
- Duplicate detected → link to existing item, do not create new entry
- RICE inputs missing → invoke `socratic-question` before scoring

---

## Socratic Skills

### socratic-question

**Trigger:** Requirement ambiguity detected, or invoked manually by any agent

**Input:**
- `requirement_text` (string, required): The requirement or assumption under review
- `current_context` (string, optional): Relevant existing specs or design docs

**Steps:**
1. Identify hidden assumptions in the requirement
2. Formulate deep-level questions (not surface-level)
3. Detect internal contradictions and name them explicitly
4. Separate established facts from unvalidated assumptions
5. Run up to 3 rounds of questioning
6. If no resolution after 3 rounds → mark open items as `[human-required]`

**Output:** Session document with questions, Q&A, and tagged assumptions

**On failure:**
- Contradiction cannot be resolved → escalate to PM and halt pipeline
- Human input required → block pipeline, document `[human-required]` items

---

## Spec Skills

### spec-writing

**Trigger:** Feature approved by PM Agent (`APPROVED` decision)

**Input:**
- `requirement_text` (string, required): Approved feature description
- `related_specs` (list, optional): Paths to existing spec files for context
- `domain_glossary` (string, optional): Domain terminology definitions

**Steps:**
1. Read domain glossary (create one if it doesn't exist under `/specs/<domain>/glossary.md`)
2. Read related specs to avoid scope overlap
3. Extract Functional Requirements (FR) and Non-Functional Requirements (NFR)
4. Define actors and use cases
5. Map Acceptance Criteria in Given/When/Then format
6. Identify and document Open Questions (OQ)
7. Write spec to `/specs/<domain>/<feature>.spec.md` with `status: draft`

**Output:** `/specs/<domain>/<feature>.spec.md` (status: draft)

**On failure:**
- Scope overlap with existing spec → invoke `socratic-question` to define boundary
- Missing domain glossary → create stub glossary before proceeding

---

## Design Skills

### design-doc

**Trigger:** Spec status transitions to `approved`

**Input:**
- `spec_approved` (string, required): Path to approved spec file
- `socratic_session` (string, optional): Path to socratic session document

**Steps:**
1. Read approved spec fully
2. Define API endpoints with HTTP method, path, request body, and response schema
3. Define TypeScript interfaces for all data models
4. Define frontend component tree (page → sections → atoms)
5. Define DB schema changes and required migrations
6. Document cross-cutting concerns: auth guards, error handling, caching, observability
7. Write design to `/docs/architecture/<feature>.design.md` with `status: ready-for-dev`

**Output:** `/docs/architecture/<feature>.design.md` (status: ready-for-dev)

**On failure:**
- Spec is ambiguous → return to `socratic-question`, do not guess
- DB migration conflicts with existing schema → flag as `[human-required]`

---

## Dev Skills

### frontend-implementation

**Trigger:** Design doc status is `ready-for-dev`, task assigned to frontend

**Input:**
- `design_doc` (string, required): Path to design doc
- `spec` (string, required): Path to approved spec
- `openapi_contract` (string, required): API contract (endpoint definitions)

**Steps:**
1. Verify design doc status is `ready-for-dev`
2. Create or update components in `/src/components/` or `/src/pages/`
3. Wire data via hooks in `/src/hooks/` using the OpenAPI contract
4. Add route in `App.tsx` if new page; wrap with `ProtectedRoute` if auth-required
5. Ensure TypeScript compiles clean: `npm run lint`
6. Commit to feature branch and open PR

**Output:** Code in `/src/`, PR opened, lint passes

**On failure:**
- Design ambiguity → do not guess, open issue against Design Agent
- New dependency required → document ADR before installing
- Lint fails → fix TypeScript errors before opening PR

---

### backend-implementation

**Trigger:** Design doc status is `ready-for-dev`, task assigned to backend

**Input:**
- `design_doc` (string, required): Path to design doc
- `spec` (string, required): Path to approved spec
- `openapi_contract` (string, required): API contract

**Steps:**
1. Verify design doc status is `ready-for-dev`
2. Define Pydantic models in `backend/models.py`
3. Implement endpoint(s) in `backend/main.py` following FastAPI patterns
4. Add auth guard via `Depends(get_current_user)` for protected routes
5. Write or update DB migration in `backend/alembic/`
6. Raise typed `HTTPException` for all error cases — never return raw exceptions
7. Commit to feature branch and open PR

**Output:** Code in `/backend/`, PR opened

**On failure:**
- Schema conflicts with DB → run alembic diff and resolve before proceeding
- New dependency required → add to `requirements.txt` and document ADR
- Missing env variable → add to `.env.example` before merging

---

## Review Skills

### code-review

**Trigger:** PR opened against main branch

**Input:**
- `PR_url` (string, required): Pull request URL
- `spec` (string, required): Path to spec file
- `design_doc` (string, required): Path to design doc
- `contract` (string, required): OpenAPI contract path
- `test_results` (string, required): CI test output
- `lint_results` (string, required): CI lint output

**Steps:**
1. Verify code implements spec requirements (no more, no less)
2. Verify code matches design doc (endpoints, component tree, DB schema)
3. Verify tests pass
4. Verify lint passes (`npm run lint` / `mypy`)
5. Verify tracking instrumentation is present for new features
6. Verify any new env variables are documented in `.env.example`
7. Emit decision: ✅ Approved / ❌ Changes required / ⚠️ Breaking change

**Output:** Review decision with inline comments

**Checklist:**
- [ ] Code follows spec and design
- [ ] Tests pass
- [ ] Lint passes (`npm run lint` / `mypy`)
- [ ] No breaking changes without ADR
- [ ] Tracking instrumentation present
- [ ] Environment variables documented in `.env.example`

**On failure:**
- ❌ Changes required: Dev Agent retries (max 3 attempts)
- ⚠️ Breaking change: Human gate — do not merge without explicit approval

---

## Data Skills

### event-schema

**Trigger:** New feature merged, analytics instrumentation required

**Input:**
- `feature_name` (string, required): Name of the shipped feature
- `acceptance_criteria` (string, required): Accepted ACs from spec

**Steps:**
1. For each Acceptance Criterion, identify the event it represents
2. Name events using `<entity>_<past_verb>` convention
3. Define schema with required and optional properties
4. Create TypeScript typed interface in `/src/lib/analytics/`

**Output:** Typed event schemas in `/src/lib/analytics/`

**Example:**
```typescript
// Event: reading_created
{
  timestamp: number,       // Unix ms
  session_id: string,      // UUID
  user_id: string,         // Anonymized
  user_role: RoleEnum,
  platform: PlatformEnum,
  oracle_type: string      // "iching" | "tarot" | "runes"
}
```

**On failure:**
- AC does not map cleanly to a single event → split into multiple events or invoke `socratic-question`

---

### tracking-plan

**Trigger:** New event schemas created for a feature

**Input:**
- `spec` (string, required): Approved spec path
- `existing_tracking_plan` (string, optional): Current tracking plan for deduplication

**Steps:**
1. For each event schema, create a tracking plan entry (event name, trigger, properties, owner)
2. Verify every AC has corresponding coverage in tracking plan
3. Validate all event names follow `<entity>_<past_verb>` naming convention
4. Update `tracking-plan.md`

**Output:** `tracking-plan.md` updated

**On failure:**
- AC not covered → add missing event schema before updating plan

---

## Marketing Skills

### voice-and-tone

**Trigger:** Any user-facing copy created or modified

**Input:**
- `text_to_review` (string, required): Copy to validate
- `context` (enum, required): `ui` | `release` | `doc` | `email` | `social`

**Steps:**
1. Verify subject is the user, not the product ("You can…" not "The app allows…")
2. Verify no unexplained technical jargon
3. Verify no filler words ("básicamente", "simplemente", "just")
4. Verify tone is consistent with `context` (mystical/intimate for UI, clear/brief for release)

**Output:** Validated or corrected text with inline notes

**On failure:**
- Multiple violations → return full rewrite suggestion, do not patch inline

---

### ui-copy

**Trigger:** New UI component or page added

**Input:**
- `ui_spec` (string, required): Component/page UI specification
- `spec` (string, required): Feature spec path
- `domain_glossary` (string, optional): Domain terminology

**Steps:**
1. For each component, define empty-state copy
2. For each form field, define placeholder and validation messages
3. For each action button, define confirmation messages
4. For each error state, define actionable error messages
5. Run `voice-and-tone` skill on all output copy

**Output:** Copy inventory in `/content/copy/<feature>.md`

**On failure:**
- Ambiguous component state → document as `[copy-needed]` and flag for design review

---

### release-notes

**Trigger:** Feature branch merged to main

**Input:**
- `changelog` (string, required): Git changelog or PR description
- `merged_specs` (list, required): Paths to merged spec files

**Steps:**
1. Filter only user-visible changes (exclude refactors, chores, internal tooling)
2. Translate technical language to user language
3. Order sections by user impact (high → low)
4. Add "What this means for you" summary section

**Output:** `release-notes.md` published to `/content/releases/`

**On failure:**
- Change is internal only → skip release notes entry, document in `CHANGELOG.md` only

---

## Invocation Template

Use this template when defining new skills:

```markdown
### <skill-name>

**Trigger:** <event or condition that activates this skill>

**Input:**
- `<name>` (`<type>`, required|optional): <description>

**Steps:**
1. <action>
2. <validation>
3. <output>

**Output:**
- `<artifact>`: <description>

**On failure:**
- <condition>: <action if fails>
```