# Prompt Template Library

> **Purpose**: Standardize execution prompts sent to Claude Code / Cowork agents.
> Provides validated structures so Gen can write prompts or ask Claude to draft them.
> Based on patterns from Day 1-7 prompts that worked well.

---

## Prompt Writing Principles

1. **Gen defines the skeleton; Claude fills in the details**
2. **Define success criteria first**
3. **List target files explicitly** — never "find and fix on your own"
4. **Include verification steps** — build + Gen's manual check
5. **State prohibitions** — suppressHydrationWarning, eslint-disable, etc.

---

## Template A: Bug Fix Prompt

```markdown
# [Bug Name] Fix Prompt

## Objective
[One sentence: what is being fixed]

## Background
[Why this bug occurs — root cause]

## Target Files
| File | Change |
|------|--------|
| `path/file.tsx` | [Specific change] |

## Fix Approach
[The approach Gen selected]
[Concrete code changes — before/after]

## Prohibitions
- No suppressHydrationWarning
- No eslint-disable
- No @ts-ignore
- No modifying files not listed above

## Verification
1. `npm run build && npm run lint` must pass
2. Gen manually checks:
   - [ ] [Specific check 1]
   - [ ] [Specific check 2]

## Rollback Criteria
[Under what conditions we revert everything]
```

---

## Template B: Feature Addition Prompt

```markdown
# [Feature Name] Addition Prompt

## Objective
[One sentence: what is being built]

## Success Criteria (Defined by Gen)
- [ ] [Condition 1]
- [ ] [Condition 2]

## Runtime Flow (≤5 steps)
1. Server: [what happens]
2. Browser: [what is displayed]
3. User: [what they can do]

## Files to Modify/Create
| File | Action | Description |
|------|--------|-------------|
| `path/file.tsx` | Modify | [What changes] |
| `path/new-file.tsx` | Create | [What it does] |

## Data Structure (if applicable)
[JSON schema, type definitions, etc.]

## Legal Check (if applicable)
- [ ] CLAUDE.md Legal Bright Lines compliance confirmed
- [ ] No prohibited phrases ("you qualify", scores, percentages)

## Prohibitions
- No modifying components/ui/
- No installing unlisted packages
- No suppressHydrationWarning

## Verification
1. `npm run build && npm run lint`
2. Gen manually checks:
   - [ ] [Check item]

## Rollback Criteria
[Conditions]

## Document Updates
- [ ] TECH-DEBT.md (if new debt)
- [ ] DECISION-LOG.md (if decisions made)
- [ ] ARCHITECTURE-MAP.md (if structure changed)
```

---

## Template C: Audit / Analysis Prompt

```markdown
# [Audit Target] Audit Prompt

## Objective
[What is being inspected]

## Audit Criteria
[Standards for identifying violations/issues]
- Criterion 1: [e.g., CLAUDE.md Legal Bright Lines]
- Criterion 2: [e.g., Taiwan Immigration Act §56]

## Scope
- Files: [Which folders/files to inspect]
- Patterns: [Keywords to grep for]

## Output Format
| # | Severity | File | Line | Issue | Suggested Fix |
|---|----------|------|------|-------|---------------|

## Save Results To
`docs/agent/reports/[audit-name]-report.md`
```

---

## Template D: Data / Content Change Prompt

```markdown
# [Data Name] Change Prompt

## Objective
[What data is being changed and how]

## Change Targets
| File | Field | Before | After |
|------|-------|--------|-------|

## Impact Scope
[Pages/components that consume this data]

## Verification
1. `npm run build`
2. Check affected pages for correct rendering
```

---

## Validated Prompt Examples (What Worked)

| Prompt | Tasks | Result | Why It Worked |
|--------|-------|--------|---------------|
| LEGAL-FIX-PROMPT.md | 8 tasks | ✅ 6/6 violations fixed | Per-file changes with before/after code |
| SPRINT-0-PROMPT.md | 5 tasks | ✅ Build success | Clear prerequisites |
| FLICKER-FIX-PROMPT.md | 6 tasks | ✅ Verified | Gen chose approach per task before writing |

## Lessons from Failed Prompts

| Problem | Cause | Lesson |
|---------|-------|--------|
| Hydration fix didn't stop flickering | Fixed layout only, not components | **List exact target files** |
| Puppeteer verification missed issues | Test scope too narrow | **Gen defines verification scope** |
| suppressHydrationWarning overuse | Prohibitions not stated | **Always include Prohibitions section** |

---

*When Gen writes a prompt: just fill in the [ ] placeholders in the template.*
*Or ask Claude: "Draft a prompt using Template A for this bug."*
