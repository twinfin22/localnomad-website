# Visa Detail UI Redesign — Implementation Prompt

## Overview
Redesign the visa detail page from "flat accordion list" to a **3-layer progressive disclosure** layout. Information is layered by importance: **한 눈에 (At a Glance) → 탭 (Tabs) → 참고 (Reference)**.

## Decision (Confirmed by Gen)
- **Layout**: Proposal A — 3-layer hierarchy with tabs
- **Pilot page**: F-2 (Korea Points-Based Resident Visa) — verify before applying to all visa pages
- **Data change**: Add `priority` field to JSON data for hierarchy control

## Current Problems
1. 7 accordions at the same depth — no signal for "what matters most"
2. Expanding any accordion dumps a wall of text
3. Users can't quickly tell "is this visa for me?" without reading everything
4. Mobile: scrolling through expanded accordions is exhausting

## New 3-Layer Structure

```
━━━ LAYER 1: At a Glance (always visible, no scroll needed) ━━━
┌─────────────────────────────────────────────┐
│ [Hero — existing VisaHero component]        │
│ Title, tagline, warning, 4-column summary   │
│                                             │
│ [Quick Verdict — NEW]                       │
│ 3 essential eligibility items only          │
│ (priority: "essential")                     │
└─────────────────────────────────────────────┘

━━━ LAYER 2: Deep Dive (tabs — one visible at a time) ━━━
┌─────────────────────────────────────────────┐
│ [ 자격요건 ]  [ 서류 ]  [ 절차 ]            │
│                                             │
│ (Each tab shows FULL details for that       │
│  topic — replaces accordion sections 1-4)   │
└─────────────────────────────────────────────┘

━━━ LAYER 3: Reference (collapsed, below tabs) ━━━
▶ FAQ (12개)
▶ Tips & Community
▶ Sources & Related Visas
```

## Step 0: Add `priority` Field to JSON Data

### 0a. Update type definitions — `lib/types/visa.ts`

Add `priority` to existing interfaces:

```typescript
interface Requirement {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  priority?: 'essential' | 'detail';  // NEW — default 'detail' if omitted
}

interface Document {
  id: string;
  name: string;
  nameKorean?: string;
  description: string;
  tips?: string[];
  where_to_get?: string;
  processing_time?: string;
  cost?: string;
  required: boolean;
  priority?: 'essential' | 'detail';  // NEW
}

interface FAQ {
  question: string;
  answer: string;
  priority?: 'essential' | 'detail';  // NEW
}

interface ApplicationStep {
  id: string;
  step: number;
  title: string;
  description: string;
  duration?: string;
  tips?: string[];
  links?: { label: string; url: string }[];
  priority?: 'essential' | 'detail';  // NEW — all steps are usually essential
}
```

**Rule:** `priority` is optional and defaults to `'detail'` if omitted. This means existing JSON files work without changes — only items explicitly marked `'essential'` get promoted to Layer 1.

### 0b. Update F-2 JSON — `data/visas/korea/en/f-2.json` (PILOT)

Add `priority: "essential"` to the most important items:

**Eligibility** — mark 3-4 items as essential:
```json
"eligibility": [
  { "id": "points-score", "label": "80+ points on immigration scoring system", "required": true, "priority": "essential" },
  { "id": "valid-status", "label": "Hold valid residence status (E, D, F-series)", "required": true, "priority": "essential" },
  { "id": "income", "label": "Meet income threshold based on GNI", "required": true, "priority": "essential" },
  { "id": "no-violations", "label": "No immigration violations", "required": true, "priority": "detail" },
  { "id": "korean-ability", "label": "TOPIK or KIIP completion (bonus points)", "required": false, "priority": "detail" }
]
```

**Documents** — mark 4-5 core documents as essential:
```json
"documents": [
  { "id": "application-form", "name": "Application Form", "required": true, "priority": "essential", ... },
  { "id": "passport", "name": "Passport", "required": true, "priority": "essential", ... },
  { "id": "arc", "name": "Alien Registration Card", "required": true, "priority": "essential", ... },
  { "id": "proof-of-income", "name": "Income Verification", "required": true, "priority": "essential", ... },
  { "id": "photo", "name": "Photo (3.5×4.5cm)", "required": true, "priority": "detail", ... },
  // ... remaining documents as "detail"
]
```

**FAQ** — mark top 3 as essential:
```json
"faqs": [
  { "question": "What is the minimum points score?", "answer": "...", "priority": "essential" },
  { "question": "How long does processing take?", "answer": "...", "priority": "essential" },
  { "question": "Can I work while on F-2?", "answer": "...", "priority": "essential" },
  { "question": "What if my score drops below 80?", "answer": "...", "priority": "detail" },
  // ... remaining FAQs as "detail"
]
```

## Step 1: Create Tab Layout Component

### New file: `components/visa/visa-tab-layout.tsx` (CLIENT)

This replaces `VisaAccordionLayout` as the main content container for the visa detail page.

```
Props:
  visa: VisaData (any country's visa type)
  country: string
```

**Structure:**

```tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Layer 1: Quick Verdict
// Layer 2: Tabs (Requirements / Documents / Process)
// Layer 3: Reference Accordions (FAQ, Tips, Sources)
```

### Layer 1 — Quick Verdict (NEW component)

**New file: `components/visa/sections/quick-verdict.tsx`**

Shows only `priority: "essential"` items from eligibility, plus key stats.

```
┌────────────────────────────────────────┐
│ At a Glance                            │
│                                        │
│ ✅ 80+ points on scoring system        │
│ ✅ Valid residence status (E/D/F)      │
│ ✅ Income meets GNI threshold          │
│                                        │
│ 📄 12 documents needed                 │
│ 📋 6 application steps                 │
│ ⏱️ 4–6 weeks processing               │
│                                        │
│ [See Full Requirements ↓]              │
└────────────────────────────────────────┘
```

**Implementation:**
- Filter `visa.eligibility.filter(e => e.priority === 'essential')`
- Show counts for documents and steps
- CTA button scrolls to tabs section OR switches to Requirements tab
- Server component friendly (no interactivity needed)
- Card-style with subtle border, rounded corners

### Layer 2 — Tabs Section

Use shadcn/ui `Tabs` component (Radix). Three tabs:

**Tab 1: Requirements (자격요건)**
Combines current `KeyRequirements` content:
- All eligibility items (both essential and detail)
- Essential items highlighted at top with green left-border
- Detail items below in collapsible section ("Show more requirements")
- Income requirement box
- Work permission box
- Insurance/Tax sections (Korea-specific)

**Tab 2: Documents (서류)**
Combines current `DocumentChecklist` content:
- Essential documents shown first (highlighted)
- Remaining documents in expandable section
- Checklist functionality preserved (localStorage/Supabase)
- Progress bar

**Tab 3: Process (절차)**
Combines current `TimelineFees` + `ApplicationSteps`:
- Duration/fees/processing summary at top (from TimelineFees)
- Step-by-step timeline below (from ApplicationSteps)
- Renewal info at bottom (if applicable)

**Tab behavior:**
- Default tab: Requirements
- Tabs are horizontally scrollable on mobile (if text gets long)
- Tab content area has consistent padding
- URL hash updates on tab switch: `#requirements`, `#documents`, `#process`
  - So users can share direct links to a specific tab

### Layer 3 — Reference Section (collapsed)

Below the tabs, use existing Accordion for less-critical content:

```
▶ Frequently Asked Questions ({count})
   - Show essential FAQs expanded by default
   - Detail FAQs collapsed

▶ Tips & Community
   - Same as current TipsCommunity component

▶ Sources & Related Visas
   - Same as current SourcesRelated component
```

## Step 2: Update Navigation

### Mobile TOC (sticky-toc.tsx)

Update pill labels to match new structure:
```
[At a Glance] [Requirements] [Documents] [Process] [FAQ] [Tips] [Sources]
```

Clicking Requirements/Documents/Process switches the tab AND scrolls to tabs section.

### Desktop Sidebar

Same update — clicking a tab-related item switches the active tab.

### Navigation state coordination:
- The mobile TOC and desktop sidebar need to know which tab is active
- When user scrolls past tabs section, the active TOC item should reflect the current tab
- Use a shared state or context between navigation and tabs

## Step 3: Update Page Component

### `app/[locale]/[country]/visa/[type]/page.tsx`

Replace `VisaAccordionLayout` with `VisaTabLayout`:

```tsx
// Before:
<VisaAccordionLayout visa={visa} country={country} />

// After:
<VisaTabLayout visa={visa} country={country} />
```

Keep everything else the same: Hero, Disclaimer, JSON-LD, breadcrumbs.

**Important:** Keep `VisaAccordionLayout` file intact (don't delete). Other visa pages still use it until migration is complete.

## Step 4: Responsive Design

### Mobile (< sm)
```
[Hero]
[Quick Verdict — full width card]
[Tabs — full width, horizontally scrollable tab triggers]
[Tab content — full width]
[Reference accordions]
```

### Tablet (sm–lg)
```
[Hero]
[Quick Verdict — centered card, max-w-2xl]
[Tabs — centered, tab triggers fit in one row]
[Tab content]
[Reference accordions]
```

### Desktop (lg+)
```
[Sidebar TOC — left] [Hero + Quick Verdict + Tabs + Reference — right]
```

Desktop sidebar: same as current DesktopTocSidebar but updated labels.

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `lib/types/visa.ts` | MODIFY | Add `priority` field to Requirement, Document, FAQ, ApplicationStep |
| `data/visas/korea/en/f-2.json` | MODIFY | Add `priority: "essential"` to key items |
| `components/visa/visa-tab-layout.tsx` | CREATE | New main layout component (replaces accordion) |
| `components/visa/sections/quick-verdict.tsx` | CREATE | Layer 1 — essential items summary |
| `components/visa/sections/requirements-tab.tsx` | CREATE | Tab 1 — full requirements (refactored from KeyRequirements) |
| `components/visa/sections/documents-tab.tsx` | CREATE | Tab 2 — document checklist (refactored from ActionZone) |
| `components/visa/sections/process-tab.tsx` | CREATE | Tab 3 — timeline + steps (combined) |
| `components/visa/sticky-toc.tsx` | MODIFY | Update labels for tab-aware navigation |
| `components/visa/index.ts` | MODIFY | Add new exports |
| `app/[locale]/[country]/visa/[type]/page.tsx` | MODIFY | Switch F-2 to VisaTabLayout (conditional) |

**NOT modified (keep as-is):**
- `components/visa/visa-accordion-layout.tsx` — other visas still use this
- `components/visa/visa-hero.tsx` — unchanged
- `components/visa/visa-disclaimer.tsx` — unchanged
- All section components — reused inside new tabs, may need minor refactoring

## Pilot Strategy

Since this is F-2 only first, the page component should conditionally render:

```tsx
// In page.tsx:
{visa.type === 'f-2' ? (
  <VisaTabLayout visa={visa} country={country} />
) : (
  <VisaAccordionLayout visa={visa} country={country} />
)}
```

After Gen verifies F-2, remove the condition and apply to all visa types.

## Quality Checklist

- [ ] F-2 page renders with new 3-layer layout
- [ ] Quick Verdict shows only essential items (3-4 eligibility + counts)
- [ ] Tabs switch correctly between Requirements / Documents / Process
- [ ] Tab content matches current accordion content (no data lost)
- [ ] Document checklist still works (check/uncheck, localStorage, Supabase)
- [ ] Mobile: tabs are horizontally scrollable
- [ ] Mobile TOC syncs with active tab
- [ ] Desktop sidebar syncs with active tab
- [ ] Reference section (FAQ, Tips, Sources) renders below tabs
- [ ] Non-F-2 visa pages still use old accordion layout (no regression)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

## Gen 검증 포인트

1. **`npm run dev` → `/en/korea/visa/f-2`** 접속
   - Quick Verdict 카드에 핵심 3~4개만 보이는지
   - 탭 3개가 보이고 전환이 되는지
   - 각 탭의 내용이 기존과 동일한지 (데이터 누락 없는지)
2. **모바일 뷰** (브라우저 크기 줄이기)
   - 탭 버튼이 가로 스크롤 되는지
   - Quick Verdict이 전체 너비로 잘 보이는지
3. **서류 체크리스트** — 체크 기능이 여전히 작동하는지
4. **다른 비자 페이지** (예: `/en/korea/visa/e-7`) — 기존 아코디언 레이아웃 그대로인지
5. **기존 대비 정보 과부하가 줄었는지** — 첫 화면에서 "이 비자가 나한테 맞는지" 바로 판단 가능한지
