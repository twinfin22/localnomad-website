# Phase 3-B: Japan & China Visa JSON Data Creation

## Objective
Expand the 10 minimal visa JSON files (Japan 6 + China 4) into comprehensive, production-ready data matching the Korea F-2 reference format (437 lines). K-visa is deferred — do NOT create or modify it.

## Reference Files

### Data format reference
- `data/visas/korea/en/f-2.json` — **PRIMARY TEMPLATE**. Every JSON must match this structure exactly.

### Research data sources (USE THESE for content)
- `docs/agent/reference/japan-visa-research-2024-2026.md` — Japan visa details
- `docs/agent/reference/japan-visa-research-summary.md` — Japan summary
- `docs/agent/reference/research-china-visa-system.md` — China visa details
- `docs/agent/reference/visa-transition-paths.md` — pathsTo/pathsFrom data
- `docs/agent/reference/README-visa-transitions.md` — Transition path index

### Type definitions
- `lib/types/visa.ts` — VisaBase, JapanVisa, ChinaVisa interfaces

---

## Pre-Step: File Cleanup

The transition path agent created extra files that are NOT in scope. Handle these:

1. **Delete** `data/visas/japan/en/permanent-jp.json` — Not in the 6 Japan visas
2. **Delete** `data/visas/japan/en/student-visa.json` — Not in the 6 Japan visas
3. **Rename** `data/visas/japan/en/ssw1.json` → Check if type field says `ssw1` or `specified-skilled-1`. The JapanVisaType in `lib/types/visa.ts` uses `specified-skilled-1` / `specified-skilled-2`. **Filenames and type fields must match the TypeScript type definition.** If they don't match, decide which to align to and update both the filename AND the type union. Prefer shorter names (`ssw1`, `ssw2`) if they are already used in filenames — update the TypeScript type to match.

**IMPORTANT**: After any renames, verify `lib/visa-data.ts` AVAILABLE_VISAS entries match the filenames.

---

## Files to Create/Expand (10 total)

### Japan (6 files) — `data/visas/japan/en/`

| # | File | Type ID | Category |
|---|------|---------|----------|
| 1 | `engineer-specialist.json` | engineer-specialist | work |
| 2 | `hsw.json` | hsw | work |
| 3 | `ssw1.json` | (match TypeScript type) | work |
| 4 | `ssw2.json` | (match TypeScript type) | work |
| 5 | `digital-nomad-jp.json` | digital-nomad-jp | temporary |
| 6 | `business-manager.json` | business-manager | work |

### China (4 files) — `data/visas/china/en/`

| # | File | Type ID | Category |
|---|------|---------|----------|
| 7 | `z-visa.json` | z-visa | work |
| 8 | `r-visa.json` | r-visa | work |
| 9 | `x1-visa.json` | x1-visa | study |
| 10 | `permanent-cn.json` | permanent-cn | residence |

---

## JSON Structure Specification

Every file MUST contain ALL of these fields. Reference `data/visas/korea/en/f-2.json` for exact format.

```jsonc
{
  // === IDENTITY ===
  "type": "visa-id",                    // Must match TypeScript type + filename
  "name": "Full Official Name — Complete 2026 Guide",
  "shortName": "Display Name",
  "category": "work|residence|temporary|study",
  "description": "2-3 sentences. What this visa is, who it's for, key requirement, duration.",
  "tagline": "One-line marketing tagline",
  "keyRequirement": "The single most important requirement",
  "targetAudience": ["3-5 specific user personas"],

  // === ELIGIBILITY ===
  "eligibility": [
    {
      "id": "unique-kebab-id",
      "label": "Short requirement label",
      "description": "Full explanation with specifics (numbers, thresholds, exceptions)",
      "required": true  // true = mandatory, false = alternative/optional track
    }
  ],

  // === DURATION & FEES ===
  "duration": {
    "initial": "Period with details",
    "extension": "Extension rules",
    "maxTotal": "Maximum possible stay"
  },
  "fees": {
    "application": "Amount in local currency (~USD equivalent)",
    "extension": "Extension fee if applicable",
    "notes": "Fee caveats"
  },
  "incomeRequirement": {          // Include if visa has income threshold
    "amount": "number or range",
    "currency": "JPY|CNY|USD",
    "period": "annual|monthly",
    "proofMethods": ["tax records", "bank statements", ...]
  },

  // === DOCUMENTS ===
  "documents": [
    {
      "id": "doc-kebab-id",
      "name": "English Document Name",
      "nameLocal": "日本語名 or 中文名",   // nameJapanese for JP, nameChinese for CN
      "description": "What this document is and purpose",
      "tips": ["Practical advice for obtaining this document"],
      "required": true
    }
  ],

  // === PROCESS ===
  "applicationSteps": [
    {
      "id": "step-1",
      "step": 1,
      "title": "Step Title",
      "description": "What to do in this step",
      "duration": "Time estimate",
      "tips": ["Practical advice"]
    }
  ],
  "processingTime": {
    "typical": "X–Y weeks/months",
    "expedited": "If available",
    "notes": "Caveats about processing time variability"
  },

  // === PERMISSIONS ===
  "workPermission": {
    "allowed": true,
    "restrictions": "What work is/isn't allowed",
    "notes": "Additional context"
  },
  "familyAllowed": true,           // NEW field on VisaBase

  // === CONTENT ===
  "faqs": [
    {
      "question": "Common question?",
      "answer": "Detailed answer with specifics. Use 'Published guidelines indicate...' or 'According to published requirements...' phrasing. NEVER say 'you qualify' or 'you are eligible'."
    }
  ],
  "tips": ["5-8 practical tips from research + community knowledge"],
  "warnings": ["3-5 important cautions, legal risks, common mistakes"],

  // === COMMUNITY ===
  "communityTips": [
    {
      "id": "tip-kebab-id",
      "tip": "Practical community-sourced advice",
      "source": "community",
      "verified": false,
      "upvotes": 0,
      "dateAdded": "2026-03-03"
    }
  ],

  // === NAVIGATION ===
  "relatedVisas": ["other-visa-type-ids"],  // Within same country
  "pathsTo": [                               // What visas lead TO this one
    "visa-type-id"                           // Simple array for pathsTo
  ],
  "pathsFrom": [                             // What visas you can get FROM this one
    {
      "type": "visa-type-id",
      "name": "Full visa name",
      "requirements": "What's needed for this transition",
      "timeline": "How long the transition takes",
      "documents": ["Required documents for transition"],
      "notes": "Additional context about this pathway"
    }
  ],

  // === META ===
  "lastUpdated": "2026-03-03",
  "officialLinks": [
    {
      "label": "Source name",
      "url": "https://official-url"
    }
  ],

  // === JAPAN-SPECIFIC (Japan visas only) ===
  "residenceStatus": "在留資格 name",
  "sponsorRequired": true,
  "coeRequired": true,
  "pointsSystem": { ... },           // HSW only
  "japaneseLanguage": { ... },       // If applicable
  "designatedSectors": ["..."],      // SSW1/SSW2 only
  "reentryGap": "...",               // Digital nomad only

  // === CHINA-SPECIFIC (China visas only) ===
  "workPermitCategory": "A|B|C",     // Z-visa: include ALL THREE as sections
  "puLetterRequired": true,
  "psbRegistration": { ... },
  "residencePermitDeadline": 30,
  "invitationRequired": true,
  "talentCertification": { ... },    // R-visa only
  "covaOnline": true,
  "stemFields": ["..."]              // If applicable
}
```

---

## Country-Specific Instructions

### Japan Visas

**General rules:**
- Use `nameLocal` with Japanese (e.g., `"nameLocal": "在留資格認定証明書"`)
- COE (Certificate of Eligibility / 在留資格認定証明書) is required for most work visas — explain the employer-initiated process clearly
- Fee amounts in JPY with USD equivalent
- Reference FY2026 fee increases where applicable
- `sponsorRequired: true` for all except digital-nomad-jp

**Per-visa notes:**

1. **engineer-specialist** — Most common work visa. Bachelor's degree + job offer. 1-5 year terms. Covers IT, engineering, international business, design, translation. Include the breadth of qualifying occupations.

2. **hsw** (Highly Skilled Worker / 高度専門職) — Points-based system (70+ points). Three subcategories: Academic Research, Technical/Specialist, Business Management. Include the points table structure (age, salary, education, bonus). 80+ points = PR in 1 year. 70+ points = PR in 3 years. This is Japan's fastest path to permanent residence.

3. **ssw1** (Specified Skilled Worker 1 / 特定技能1号) — 14 designated sectors. Max 5 years CUMULATIVE (not renewable). Japanese language test + sector skill test required. NO family allowed.

4. **ssw2** (Specified Skilled Worker 2 / 特定技能2号) — Upgraded from SSW1. Currently 11 sectors (expanding). Unlimited renewals. Family allowed. Path to PR. Include the SSW1→SSW2 transition requirements.

5. **digital-nomad-jp** — Launched March 2024. ¥10M annual income requirement. 6-month stay, non-renewable. Must wait 6 months before reapplying (`reentryGap: "6 months"`). `sponsorRequired: false`, `coeRequired: false`. 49 eligible nationalities.

6. **business-manager** — ¥5M capital OR 2+ full-time employees. **IMPORTANT Oct 2025 UPDATE**: Capital requirement increased to ¥30M for new applications. Include both old and new requirements with clear dating. 1-5 year terms.

### China Visas

**General rules:**
- Use `nameLocal` with Simplified Chinese (e.g., `"nameLocal": "工作签证"`)
- PSB registration (24-hour rule) applies to ALL China visas — include in every file
- Fee amounts in CNY with USD equivalent
- PU Letter requirements have been relaxed post-COVID for most cities but still required in some — note the variability
- **CRITICAL**: China does NOT allow in-country visa status changes. Must exit and reapply. Note this in pathsFrom.

**Per-visa notes:**

7. **z-visa** — Standard work visa. Include Work Permit Category A/B/C as SECTIONS within this file:
   - Category A: High-end foreign talent (no quota, fast-track)
   - Category B: Professional foreign talent (standard, most common)
   - Category C: Temporary/seasonal (quota-controlled, limited)
   Structure the `workPermitCategory` field and add a `workPermitDetails` section explaining all three tiers, their point thresholds, and practical differences. This is the most content-heavy China visa file.

8. **r-visa** — High-end talent visa. 5-10 year multiple entry. For nationally recognized experts, senior executives, specialized talent. Include `talentCertification` details. Overlap with Z-visa Category A — explain the difference clearly.

9. **x1-visa** — Long-term student visa (180+ days). Must convert to Residence Permit within 30 days of entry. Include scholarship information (CSC, provincial). Note: graduates must exit China and apply for Z-visa to work — no in-country conversion.

10. **permanent-cn** — Chinese "Green Card". Extremely difficult (historically <1% approval for most tracks). Multiple tracks: employment-based (4 consecutive years), investment-based (stable investment + tax record), family-based (marriage to Chinese citizen), special contribution. Include realistic processing expectations.

---

## Legal Compliance (CRITICAL)

Every visa JSON description, FAQ answer, and tip MUST follow these rules:

### NEVER use:
- "you qualify" / "you are eligible" / "you should apply"
- "recommended visa" / "best visa for you"
- "guaranteed" / "will be approved"
- "official requirements" (use "published requirements" instead)

### ALWAYS use:
- "Published guidelines indicate..."
- "According to published requirements..."
- "Based on published information..."
- "Check with [official authority] for current requirements"

### Japan disclaimer reference:
- 行政書士法 (Administrative Scrivener Act) — No personalized recommendations
- Add to every FAQ answer where eligibility could be implied

### China disclaimer reference:
- Do NOT use the word "consulting" (咨询) to describe any feature
- No eligibility assessment, no personalized recommendations

---

## Quality Checklist

For EACH of the 10 JSON files, verify:

- [ ] `type` field matches TypeScript type definition AND filename
- [ ] All VisaBase fields present (no missing fields)
- [ ] Country-specific fields present (JapanVisa or ChinaVisa interface)
- [ ] `eligibility` array has 3-6 items with unique IDs
- [ ] `documents` array has 5-10 items with tips
- [ ] `applicationSteps` array has 4-7 steps with durations
- [ ] `faqs` array has 6-10 Q&A pairs
- [ ] `tips` array has 5-8 items
- [ ] `warnings` array has 3-5 items
- [ ] `communityTips` array has 3-5 items with dateAdded "2026-03-03"
- [ ] `pathsTo` populated from transition research
- [ ] `pathsFrom` populated with full detail objects (type, name, requirements, timeline, documents, notes)
- [ ] `officialLinks` has 2-4 verified URLs
- [ ] `relatedVisas` lists 2-4 related visas within same country
- [ ] `familyAllowed` boolean is present
- [ ] No legal compliance violations (grep for "you qualify", "eligible", "guaranteed", etc.)
- [ ] Valid JSON (no trailing commas, no comments)
- [ ] File size roughly 300-500 lines (comparable to F-2 reference)

---

## Execution Order

1. **Pre-step**: Clean up files (delete permanent-jp, student-visa; resolve ssw naming)
2. **Japan batch 1**: engineer-specialist, hsw, business-manager (most data available)
3. **Japan batch 2**: ssw1, ssw2, digital-nomad-jp
4. **China batch 1**: z-visa (largest file — includes Work Permit A/B/C sections)
5. **China batch 2**: r-visa, x1-visa, permanent-cn
6. **Verify**: Run `npm run build` to confirm all files load correctly
7. **Legal scan**: Grep all 10 files for prohibited phrases

---

## Verification Commands

```bash
# Check all files exist
ls -la data/visas/japan/en/ data/visas/china/en/

# Validate JSON syntax
for f in data/visas/japan/en/*.json data/visas/china/en/*.json; do
  python3 -c "import json; json.load(open('$f'))" && echo "OK: $f" || echo "FAIL: $f"
done

# Legal compliance scan
grep -rn "you qualify\|you are eligible\|recommended visa\|guaranteed\|official requirements" data/visas/japan/ data/visas/china/

# Check type field matches filename
for f in data/visas/japan/en/*.json data/visas/china/en/*.json; do
  TYPE=$(python3 -c "import json; print(json.load(open('$f'))['type'])")
  BASENAME=$(basename "$f" .json)
  [ "$TYPE" = "$BASENAME" ] && echo "MATCH: $f" || echo "MISMATCH: $f (type=$TYPE, file=$BASENAME)"
done

# Build test
npm run build
```

---

## What NOT To Do

- Do NOT create K-visa (deferred — insufficient data)
- Do NOT create permanent-jp.json or student-visa.json (not in scope)
- Do NOT create locale translations (English only for now)
- Do NOT modify `components/ui/` (shadcn/ui managed)
- Do NOT modify Korea or Taiwan visa data files
- Do NOT create visa detail pages or UI components (that's Phase 3-C/3-D)
- Do NOT use `eslint-disable`, `@ts-ignore`, or `suppressHydrationWarning` without approval
