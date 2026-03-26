# SKILLS.md — MyGrimoria

> Executable skills for LLM agents. Reference each skill by its section.

---

## Index

| Skill | Section |
|-------|---------|
| rice-scoring | PM |
| backlog-management | PM |
| socratic-question | Socratic |
| spec-writing | Design |
| design-doc | Design |
| code-implementation | Dev |
| code-review | Review |
| event-schema | Data |
| tracking-plan | Data |
| voice-and-tone | Marketing |
| ui-copy | Marketing |
| release-notes | Marketing |

---

## PM Skills

### rice-scoring

**Input:** requirement, okrs_current, analytics_data

**Steps:**
1. Estimate Reach (unique users per quarter)
2. Estimate Impact (0.25/0.5/1/2/3)
3. Estimate Confidence (100/80/50%)
4. Estimate Effort (person-weeks)
5. Calculate RICE = (Reach × Impact × Confidence) / Effort
6. Compare with top-5 backlog

**Output:** Backlog entry with score and decision

---

### backlog-management

**Input:** event_type (new_request|analytics_report|periodic_review)

**Steps:**
1. Classify request
2. Execute RICE scoring
3. Detect duplicates
4. Reorder backlog
5. Archive rejected > 90 days

**Output:** backlog.md updated

---

## Socratic Skills

### socratic-question

**Input:** requirement_text, current_context

**Steps:**
1. Identify hidden assumptions
2. Formulate deep-level questions
3. Detect contradictions
4. Separate facts from assumptions
5. Max 3 rounds → if no resolution, mark `[human-required]`

**Output:** Documented session with questions, identified assumptions

---

## Design Skills

### spec-writing

**Input:** requirement_text, related_specs, domain_glossary

**Steps:**
1. Read domain glossary
2. Read related specs
3. Extract FR, NFR, actors
4. Map AC (Given/When/Then)
5. Identify OQ (open questions)
6. Write spec in `/specs/<domain>/<feature>.spec.md`

**Output:** spec.md (status: draft)

---

### design-doc

**Input:** spec_approved, socratic_session

**Steps:**
1. Define API endpoints
2. Define request/response schemas
3. Define DB schema
4. Define frontend component tree
5. Identify cross-cutting concerns
6. Write design.md

**Output:** design.md (status: ready-for-dev)

---

## Dev Skills

### code-implementation

**Input:** design_doc, spec, openapi_contract

**Steps:**
1. Verify design approved
2. Implement according to contract
3. Write unit tests
4. Apply lint
5. Commit to feature branch
6. Open PR

**Output:** Code in repo, PR opened

---

## Review Skills

### code-review

**Input:** PR_url, spec, design_doc, contract, test_results, lint_results

**Steps:**
1. Verify code follows spec and design
2. Verify tests pass
3. Verify lint passes
4. Verify instrumentation present
5. Emit decision: Approved / Changes required / Breaking change

**Output:** Review completed, decision emitted

**Checklist:**
- [ ] Code follows spec and design
- [ ] Tests pass
- [ ] Lint passes
- [ ] No breaking changes without ADR
- [ ] Tracking instrumentation present
- [ ] Environment variables documented

---

## Data Skills

### event-schema

**Input:** feature_name, acceptance_criteria

**Steps:**
1. For each AC, define needed event
2. Name: `<entity>_<past_verb>`
3. Define schema with required/optional properties
4. Create TypeScript/Python typed schemas

**Output:** Schemas in `/lib/analytics/`

**Example:**
```typescript
// Event: feature_created
{
  timestamp: number,    // Unix ms
  session_id: string,   // UUID
  user_id: string,       // Anonymized
  user_role: RoleEnum,
  platform: PlatformEnum,
  feature_type: string   // Specific to event
}
```

---

### tracking-plan

**Input:** spec, existing_tracking_plan

**Steps:**
1. For each event, create tracking plan entry
2. Verify coverage of all AC
3. Validate naming conventions

**Output:** tracking-plan.md updated

---

## Marketing Skills

### voice-and-tone

**Input:** text_to_review, context (ui|release|doc|email|social)

**Steps:**
1. Verify subject = user (not product)
2. Verify no technicisms without explanation
3. Verify no filler ("básicamente", "simply")
4. Verify tone consistent with context

**Output:** Validated or corrected text

---

### ui-copy

**Input:** ui_spec, spec, domain_glossary

**Steps:**
1. For each component, define empty state
2. For each field, define validation messages
3. For each action, define confirmations
4. For each error, define actionable messages

**Output:** Inventory in `/content/copy/`

---

### release-notes

**Input:** changelog, merged_specs

**Steps:**
1. Filter changes relevant to users
2. Translate technicisms to user language
3. Order by impact
4. Add "what it means for you" section

**Output:** release-notes.md

---

## Invocation Template

```markdown
### <skill-name>

**Trigger:** <event>

**Input:**
- `<name>` (`<type>`, required|optional): <description>

**Steps:**
1. <action>
2. <validation>
3. <output>

**Output:**
- `<artifact>`: <description>

**Checks:**
- <prerequisite condition>

**On failure:**
- <action if fails>
```