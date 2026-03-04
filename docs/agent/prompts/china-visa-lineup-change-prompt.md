# China Visa Lineup Change: R-Visa/Permanent-CN → K-Visa

## Context
China visa lineup is changing from `[z-visa, r-visa, x1-visa, permanent-cn]` to `[z-visa, x1-visa, k-visa]`.
- `k-visa.json` has ALREADY been created at `data/visas/china/en/k-visa.json` — do NOT recreate it
- `r-visa.json` and `permanent-cn.json` need to be deleted
- All cross-references need updating

## Tasks (execute in order)

### 1. Delete old visa files
```bash
git rm data/visas/china/en/r-visa.json
git rm data/visas/china/en/permanent-cn.json
```

### 2. Update `lib/visa-data.ts`
Change line 16:
```
// FROM:
china: ['z-visa', 'r-visa', 'x1-visa', 'permanent-cn'],
// TO:
china: ['z-visa', 'x1-visa', 'k-visa'],
```

### 3. Update `lib/types/visa.ts`
In the `ChinaVisaType` union type, remove `'r-visa'` and `'permanent-cn'`. Keep `'k-visa'` (it should already be there). The result should be:
```typescript
| 'z-visa'
| 'k-visa'
| 'x1-visa'
```
Also update the array constant if one exists to match.

### 4. Update `app/sitemap.ts`
Change the china array:
```
// FROM:
china: ['z-visa', 'r-visa', 'x1-visa', 'permanent-cn'],
// TO:
china: ['z-visa', 'x1-visa', 'k-visa'],
```

### 5. Update `data/visas/china/en/z-visa.json`
- In `relatedVisas` array: remove `"r-visa"` and `"permanent-cn"`, add `"k-visa"`
- In `pathsTo` array: remove the objects with `"type": "r-visa"` and `"type": "permanent-cn"`. Add:
```json
{
  "type": "k-visa",
  "name": "K Visa (STEM Talent)",
  "requirements": "Bachelor's degree or higher in STEM from a recognized university, aged 18–45. No employer sponsorship required.",
  "timeline": "4–5 business days standard processing",
  "notes": "For Z Visa holders who want to transition to independent STEM work without employer ties. The K Visa allows research, entrepreneurship, and job-seeking without sponsorship."
}
```

### 6. Update `data/visas/china/en/x1-visa.json`
- In `relatedVisas` array: remove `"r-visa"` and `"permanent-cn"`, add `"k-visa"`
- If there are any `pathsTo` or `pathsFrom` entries referencing r-visa or permanent-cn, update them to reference k-visa or remove them as appropriate

### 7. Update `components/dashboard/onboarding-form.tsx`
Find the line:
```
{ type: 'r-visa', label: 'R Visa — High-level Talent' },
```
Replace with:
```
{ type: 'k-visa', label: 'K Visa — STEM Talent' },
```

### 8. Verify
- Run `npx tsc --noEmit` to check for TypeScript errors
- Verify all JSON files are valid: `python3 -c "import json; [json.load(open(f)) for f in ['data/visas/china/en/z-visa.json', 'data/visas/china/en/x1-visa.json', 'data/visas/china/en/k-visa.json']]"`
- Run `git diff --stat` to verify exactly 7 files changed (2 deleted + 5 modified)

## Files Affected (total: 7)
| File | Action |
|------|--------|
| `data/visas/china/en/r-visa.json` | DELETE |
| `data/visas/china/en/permanent-cn.json` | DELETE |
| `data/visas/china/en/z-visa.json` | MODIFY (relatedVisas + pathsTo) |
| `data/visas/china/en/x1-visa.json` | MODIFY (relatedVisas) |
| `lib/visa-data.ts` | MODIFY (AVAILABLE_VISAS) |
| `lib/types/visa.ts` | MODIFY (ChinaVisaType) |
| `app/sitemap.ts` | MODIFY (china array) |
| `components/dashboard/onboarding-form.tsx` | MODIFY (R→K visa option) |

## Do NOT
- Do NOT modify or recreate `k-visa.json` — it already exists and is complete
- Do NOT modify any non-China visa files
- Do NOT change any component rendering logic
- Do NOT force push
