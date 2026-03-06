# Visa Detail Page UX Improvements — Execution Prompt

## Context

The F-2 visa detail page UI was redesigned as a pilot. After audit, multiple UX issues were found. This prompt covers all fixes across 3 categories: A (bug fixes), B (UX improvements), C (polish).

**Reference files to read first:**
- `components/visa/sections/requirements-tab.tsx` (already refactored to data-driven categories)
- `components/visa/sections/quick-verdict.tsx`
- `components/visa/visa-tab-layout.tsx`
- `components/visa/sections/tips-community.tsx`
- `components/visa/sections/sources-related.tsx`
- `components/visa/sections/process-tab.tsx` + `application-steps.tsx`
- `lib/visa-data.ts` (visa ordering)
- `lib/types/visa.ts` (type definitions — already updated)

---

## A. Bug Fixes

### A1. Fix `no-` prefix icon logic — semantic mismatch

**File**: `components/visa/sections/requirements-tab.tsx`

**Current bug** (line 83):
```typescript
const isNegative = item.id.startsWith('no-');
```

This treats ALL items with `no-` prefix as negative (red X), but some are actually POSITIVE:
- `no-employer-needed` → "No employer sponsorship required" = **benefit** (should be green check)
- `no-criminal-record` → "Clean criminal record" = **standard requirement** (should be green check)

Meanwhile these ARE correctly negative:
- `no-korean-work` → "Cannot work for Korean companies" = **restriction**
- `no-work` → "No employment permitted" = **restriction**
- `no-dependents` → "No dependents allowed" = **restriction**
- `no-work-activities` → "No work permitted" = **restriction**
- `no-local-employment` → "No local employment" = **restriction**
- `no-taiwan-work` → "Must NOT work for Taiwan employer" = **restriction**

**Fix**: Add a `sentiment` field to the `Requirement` interface and use it instead of the id prefix.

**Step 1**: Update `lib/types/visa.ts` — add `sentiment` to `Requirement`:

```typescript
export interface Requirement {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  priority?: 'essential' | 'detail';
  sentiment?: 'positive' | 'negative' | 'neutral';  // NEW
  warnings?: string[];
  tips?: string[];
  category?: string;
}
```

**Step 2**: Update `requirements-tab.tsx` rendering logic:

Replace:
```typescript
const isNegative = item.id.startsWith('no-');
```

With:
```typescript
const isNegative = item.sentiment === 'negative';
const isPositive = item.sentiment === 'positive';
```

Update the icon rendering:
```tsx
{isNegative ? (
  <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
) : isPositive ? (
  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
) : item.required ? (
  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
) : (
  <Zap className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
)}
```

And the text color:
```tsx
<span className={cn(
  'text-base font-medium',
  isNegative && 'text-red-600',
  isPositive && 'text-green-600'
)}>
```

**Step 3**: Update ALL visa JSON files to add `sentiment` to items that need it:

Negative sentiment (restrictions — keep red X):
```json
{ "id": "no-korean-work", "sentiment": "negative", ... }
{ "id": "no-work", "sentiment": "negative", ... }
{ "id": "no-dependents", "sentiment": "negative", ... }
{ "id": "no-work-activities", "sentiment": "negative", ... }
{ "id": "no-local-employment", "sentiment": "negative", ... }
{ "id": "no-taiwan-work", "sentiment": "negative", ... }
{ "id": "no-ineligible-status", "sentiment": "negative", ... }
```

Positive sentiment (benefits — green check):
```json
{ "id": "no-employer-needed", "sentiment": "positive", ... }
```

Neutral / standard requirements (no sentiment field needed, defaults to required/optional logic):
```json
{ "id": "no-criminal-record", ... }  // No sentiment = uses required field
```

Search ALL JSON files in `data/visas/` for `"id": "no-` and classify each one.

### A2. Fix visa ordering for digital nomad relevance

**File**: `lib/visa-data.ts`

Change the `AVAILABLE_VISAS` order:

```typescript
const AVAILABLE_VISAS: Record<Country, string[]> = {
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'h-1', 'b-2'],               // unchanged
  taiwan: ['gold-card', 'dnv', 'visitor'],                              // unchanged
  japan: ['digital-nomad-jp', 'engineer-specialist', 'business-manager', 'hsw', 'tourist', 'ssw1', 'ssw2'],
  china: ['k-visa', 'z-visa', 'x1-visa'],
  'southeast-asia': [],
};
```

Japan rationale: Digital Nomad first (primary audience), then work visas by relevance, tourist for short stays, SSW last (blue-collar, least relevant to DN audience).

China rationale: K-visa (talent/STEM, closest to DN profile) first, then Z-visa (standard work), X1 (student) last.

---

## B. UX Improvements

### B1. At a Glance summary cards — hover popover with richer content

**File**: `components/visa/sections/quick-verdict.tsx`

The current `SummaryCard` shows a small shadcn `Tooltip` on hover for `detail`. This is too limited. Replace with a `Popover` component that shows richer content on hover (desktop) and tap (mobile).

Replace the current `SummaryCard` component:

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  const card = (
    <div className={cn(
      'rounded-lg border border-primary/30 bg-primary/[0.04] p-4 text-center transition-all',
      detail && 'cursor-pointer hover:border-primary/60 hover:shadow-md hover:bg-primary/[0.08]'
    )}>
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
      {detail && (
        <p className="mt-1 text-[10px] text-primary/50">Click for details</p>
      )}
    </div>
  );

  if (!detail) return card;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {card}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="max-w-[280px] text-sm"
        sideOffset={8}
      >
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <p className="font-semibold text-base">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{detail}</p>
      </PopoverContent>
    </Popover>
  );
}
```

Remove the old `Tooltip`/`TooltipProvider`/`TooltipContent`/`TooltipTrigger` imports — they're no longer needed in this file.

### B2. Fold less important requirements — "See additional requirements"

**File**: `components/visa/sections/requirements-tab.tsx`

Requirements like `no-criminal-record`, `good-health`, `valid-passport` appear on almost every visa and are obvious. They should be folded under an expandable "Additional requirements" section.

**Implementation:**

Add a constant for IDs that should be folded:

```typescript
const FOLDABLE_REQUIREMENT_IDS = new Set([
  'no-criminal-record',
  'good-health',
  'valid-passport',
  'health-check',
  'passport-validity',
]);
```

In the render logic, split each category's items into primary and foldable:

```typescript
{orderedCategories.map((category, catIndex) => {
  const allItems = grouped.get(category) ?? [];
  const primaryItems = allItems.filter(item => !FOLDABLE_REQUIREMENT_IDS.has(item.id));
  const foldableItems = allItems.filter(item => FOLDABLE_REQUIREMENT_IDS.has(item.id));
  const isIncome = category === 'income';

  return (
    <div key={category}>
      {catIndex > 0 && <div className="my-6 border-t" />}
      {renderCategoryHeader(category)}
      <div className="pl-7">
        <ul className="mt-3 space-y-3">{primaryItems.map(renderItem)}</ul>

        {/* Foldable additional requirements */}
        {foldableItems.length > 0 && (
          <details className="mt-4">
            <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4 transition-transform [[open]>&]:rotate-90" />
              {t('additionalRequirements', { count: foldableItems.length })}
            </summary>
            <ul className="mt-3 space-y-3">{foldableItems.map(renderItem)}</ul>
          </details>
        )}

        {/* Income metadata... (existing code) */}
      </div>
    </div>
  );
})}
```

Add import for `ChevronRight` from lucide-react.

Add i18n key in `messages/en.json`:
```json
"additionalRequirements": "See {count} additional requirements"
```

And equivalent translations in ja, vi, zh-cn, zh-tw.

### B3. Unbundle `warnings[]` into relevant sections

Currently `visa.warnings[]` is displayed in `visa-hero.tsx` as a single amber block at the top. Instead, distribute warnings to the sections they belong to.

**Data change**: In each visa JSON, move top-level `warnings` items into the relevant section's `warnings` array. For example, a warning about "document must be apostilled" should go into the relevant document's `warnings[]` array, not the top-level `warnings[]`.

After migration, set top-level `warnings` to `[]` (empty) for all visas. The hero warning block will naturally disappear.

**Where to place warnings:**
- Document-related warnings → into `documents[].warnings[]`
- Step-related warnings → into `applicationSteps[].warnings[]`
- Eligibility-related warnings → into `eligibility[].warnings[]`
- Income/fee-related warnings → into `fees.notes` or `incomeRequirement.notes`

For each visa JSON, examine every item in `warnings[]` and move it to the most relevant nested location. If a warning is truly global (applies to the whole visa), keep it in `warnings[]`.

### B4. Unbundle `communityTips` into relevant sections

Currently community tips are shown in a separate accordion section. Instead, distribute tips to the sections they relate to, rendered inline with the same Lightbulb icon as regular tips.

**Data change**: Add a `section` field to `CommunityTip` interface:

```typescript
export interface CommunityTip {
  id: string;
  tip: string;
  source?: 'discord' | 'reddit' | 'community' | 'official';
  verified: boolean;
  upvotes?: number;
  dateAdded?: string;
  section?: 'requirements' | 'documents' | 'process' | 'general';  // NEW
}
```

Tips with `section: 'general'` or no section stay in the accordion. Tips with a section get rendered inline in that section.

**Component changes:**

1. **`visa-tab-layout.tsx`**: Filter communityTips by section and pass to each tab:

```typescript
const requirementsTips = visa.communityTips?.filter(t => t.section === 'requirements') ?? [];
const documentsTips = visa.communityTips?.filter(t => t.section === 'documents') ?? [];
const processTips = visa.communityTips?.filter(t => t.section === 'process') ?? [];
const generalTips = visa.communityTips?.filter(t => !t.section || t.section === 'general') ?? [];
```

Pass to each tab:
```tsx
<RequirementsTab visa={visa} communityTips={requirementsTips} />
<DocumentsTab visa={visa} country={country} communityTips={documentsTips} />
<ProcessTab visa={visa} communityTips={processTips} />
```

Update `hasTips` to check for general tips:
```typescript
const hasTips = generalTips.length > 0;
```

Pass `generalTips` to TipsCommunity:
```tsx
<TipsCommunity tips={visa.tips} communityTips={generalTips} />
```

2. **Each tab component**: Render inline community tips at the bottom of the section, using the same Lightbulb icon style as regular tips:

```tsx
{communityTips.length > 0 && (
  <div className="mt-6 border-t pt-4">
    <ul className="space-y-2">
      {communityTips.map((ct) => (
        <li key={ct.id} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="italic">{ct.tip}</span>
        </li>
      ))}
    </ul>
  </div>
)}
```

3. **Delete verified/upvote badges**: Remove the `CheckCircle` verified badge and `ThumbsUp` upvote count from `tips-community.tsx`. The `CommunityTipCard` component should be simplified to just show the tip text with a Lightbulb icon, same as regular tips. Remove the `verified` and `upvotes` display entirely.

4. **Update JSON data**: For each visa, tag communityTips with their section:

Example for Korea F-2:
```json
"communityTips": [
  { "id": "income-lever", "section": "requirements", "tip": "Income scores make up 60 out of 170...", "verified": false },
  { "id": "kiip-classes", "section": "process", "tip": "KIIP classes fill up fast...", "verified": false },
  { "id": "blood-donation", "section": "general", "tip": "Blood donation can add points...", "verified": false }
]
```

Go through ALL visa JSON files and tag each communityTip with the appropriate section.

### B5. Related Visas — show tagline alongside button

**File**: `components/visa/sections/sources-related.tsx`

Currently related visas are just buttons with the visa type code (e.g., "E-7", "D-8"). Add the tagline so users know what each visa is for.

**Change**: The `SourcesRelated` component needs access to visa summary data. Update the interface and rendering:

```typescript
interface SourcesRelatedProps {
  officialLinks: { label: string; url: string }[];
  relatedVisas?: VisaType[];
  relatedVisaSummaries?: { type: string; shortName: string; tagline: string }[];  // NEW
  lastUpdated: string;
  country: string;
}
```

Pass related visa summaries from the page route. In `visa-tab-layout.tsx`, accept and forward this prop. In the page route (`app/[locale]/[country]/visa/[type]/page.tsx`), load summaries for related visas.

Update the rendering:

```tsx
{relatedVisaSummaries && relatedVisaSummaries.length > 0 && (
  <div>
    <div className="flex items-center gap-2">
      <ArrowRight className="h-5 w-5 text-primary" />
      <h3 className="font-lora text-base font-semibold">{t('relatedVisas')}</h3>
    </div>
    <div className="mt-4 space-y-2 pl-7">
      {relatedVisaSummaries.map((rv) => (
        <Link
          key={rv.type}
          href={`/${country}/visa/${rv.type}`}
          className="flex items-center gap-3 rounded-lg border border-primary/20 bg-white px-4 py-3 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <span className="shrink-0 rounded bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary">
            {rv.shortName}
          </span>
          <span className="text-sm text-muted-foreground">{rv.tagline}</span>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary/40" />
        </Link>
      ))}
    </div>
  </div>
)}
```

---

## C. Polish

### C1. FAQ — upgrade from `<details>` to shadcn Accordion

**File**: `components/visa/sections/faq-section.tsx`

Replace native `<details>` elements with shadcn `Accordion` for consistent styling and proper ARIA patterns.

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQ } from '@/lib/types/visa';

interface FaqSectionProps {
  faqs: FAQ[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`faq-${index}`} className="border-b-0">
          <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

### C2. Process tab — show total estimated duration

**File**: `components/visa/sections/process-tab.tsx`

Add a summary bar at the top of the process tab showing total estimated time. Use `visa.processingTime.totalEndToEnd` if available:

```tsx
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApplicationSteps } from './application-steps';
import type { Visa } from '@/lib/types/visa';

interface ProcessTabProps {
  visa: Visa;
  communityTips?: CommunityTip[];
}

export function ProcessTab({ visa, communityTips = [] }: ProcessTabProps) {
  const t = useTranslations('VisaDetail');

  return (
    <div>
      {/* Total timeline summary */}
      {visa.processingTime.totalEndToEnd && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t('estimatedTotal')}
            </p>
            <p className="text-base font-semibold text-primary">
              {visa.processingTime.totalEndToEnd}
            </p>
          </div>
          {visa.processingTime.notes && (
            <p className="ml-auto text-xs text-muted-foreground max-w-[200px]">
              {visa.processingTime.notes}
            </p>
          )}
        </div>
      )}

      <ApplicationSteps steps={visa.applicationSteps} />

      {/* Inline community tips */}
      {communityTips.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <ul className="space-y-2">
            {communityTips.map((ct) => (
              <li key={ct.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="italic">{ct.tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

Add i18n key:
```json
"estimatedTotal": "Estimated total timeline"
```

### C3. Mobile TOC — stronger active state

**File**: `components/visa/sticky-toc.tsx`

Find the mobile TOC pill buttons. Update the active state styling to use brand color background with white text:

Current (likely):
```tsx
className={cn(
  'text-sm ...',
  isActive && 'bg-primary/10 text-primary'
)}
```

Change to:
```tsx
className={cn(
  'text-sm rounded-full px-3 py-1.5 whitespace-nowrap transition-colors',
  isActive
    ? 'bg-primary text-white font-medium shadow-sm'
    : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100'
)}
```

---

## i18n Keys to Add

**`messages/en.json`** — under `VisaDetail`:
```json
{
  "additionalRequirements": "See {count} additional requirements",
  "estimatedTotal": "Estimated total timeline"
}
```

**`messages/ja.json`**:
```json
{
  "additionalRequirements": "他{count}件の要件を表示",
  "estimatedTotal": "推定合計期間"
}
```

**`messages/vi.json`**:
```json
{
  "additionalRequirements": "Xem thêm {count} yêu cầu",
  "estimatedTotal": "Tổng thời gian ước tính"
}
```

**`messages/zh-cn.json`**:
```json
{
  "additionalRequirements": "查看其他{count}项要求",
  "estimatedTotal": "预计总时间"
}
```

**`messages/zh-tw.json`**:
```json
{
  "additionalRequirements": "查看其他{count}項要求",
  "estimatedTotal": "預計總時間"
}
```

---

## Verification Checklist

1. **TypeScript**: `npx tsc --noEmit` — zero errors
2. **Build**: `npm run build` — success
3. **Lint**: `npm run lint` — pass
4. **Visual check — F-2 page**:
   - At a Glance cards: hover shows popover with detail
   - Requirements: `no-criminal-record` shows green check (not red X)
   - Requirements: criminal record + health items folded under "See additional requirements"
   - No top-level warnings block in hero (all distributed)
   - Community tips appear inline in their sections
   - Process tab shows total timeline summary bar
5. **Visual check — Japan DN page**:
   - `no-criminal-record` = green check
   - Visa appears FIRST in Japan visa listing
6. **Visual check — China K-visa page**:
   - `no-employer-needed` = green check with green text
   - K-visa appears FIRST in China visa listing
7. **Related visas**: Show tagline next to visa code
8. **Mobile TOC**: Active pill has brand color background + white text
9. **FAQ**: Uses shadcn Accordion, not native `<details>`

---

## File Impact Summary

**Type changes** (1 file):
- `lib/types/visa.ts` — Add `sentiment` to Requirement, `section` to CommunityTip

**Component changes** (8 files):
- `components/visa/sections/requirements-tab.tsx` — sentiment logic, foldable items
- `components/visa/sections/quick-verdict.tsx` — Popover instead of Tooltip
- `components/visa/sections/process-tab.tsx` — total timeline, inline tips
- `components/visa/sections/tips-community.tsx` — remove verified/upvote badges, simplify
- `components/visa/sections/sources-related.tsx` — related visa taglines
- `components/visa/sections/faq-section.tsx` — shadcn Accordion
- `components/visa/visa-tab-layout.tsx` — distribute community tips by section
- `components/visa/sticky-toc.tsx` — mobile active state

**Data changes** (1 file):
- `lib/visa-data.ts` — reorder Japan + China

**i18n** (5 files):
- `messages/{en,ja,vi,zh-cn,zh-tw}.json`

**Visa JSON** (33 files):
- Add `sentiment` to relevant eligibility items
- Add `section` to community tips
- Migrate `warnings[]` into nested locations

**Total**: ~47 files modified
