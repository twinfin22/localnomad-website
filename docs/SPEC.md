# LocalNomad Website Specifications

This document defines the design principles, component specifications, and guidelines for maintaining a clean, maintainable codebase with **high cohesion** and **low coupling**.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Component Specifications](#component-specifications)
3. [Data Specifications](#data-specifications)
4. [State Management Rules](#state-management-rules)
5. [Adding New Features](#adding-new-features)
6. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
7. [Checklist for PRs](#checklist-for-prs)

---

## Design Principles

### High Cohesion

> Components should do ONE thing well. All code within a component should be closely related to its single purpose.

**Rules:**

1. **Single Responsibility**
   - Each component handles ONE concern
   - If a component does multiple things, split it

2. **Self-Contained Data**
   - Component-specific data lives with the component
   - Shared data goes in `/data/`

3. **Co-located Logic**
   - Keep related code together
   - Handlers, helpers, and types near their usage

```
GOOD: High Cohesion
┌─────────────────────────────┐
│     PricingSection.tsx      │
├─────────────────────────────┤
│ - Pricing display logic     │
│ - Pricing card rendering    │
│ - Pricing-specific styles   │
│ - Pricing data (or import)  │
└─────────────────────────────┘

BAD: Low Cohesion
┌─────────────────────────────┐
│     PricingSection.tsx      │
├─────────────────────────────┤
│ - Pricing display logic     │
│ - FAQ rendering (unrelated) │
│ - Contact form (unrelated)  │
│ - Analytics tracking        │
└─────────────────────────────┘
```

### Low Coupling

> Components should be independent. Changing one component should NOT require changing others.

**Rules:**

1. **Props Over Context**
   - Pass data explicitly via props
   - Use context only for truly global state (theme)

2. **No Direct Component Imports Between Features**
   - Features don't import from other features
   - Share through `/components/common/` or `/components/ui/`

3. **Interface-Based Communication**
   - Define clear prop interfaces
   - Components don't know implementation details of others

```
GOOD: Low Coupling
┌──────────┐     props      ┌──────────┐
│  Parent  │ ─────────────► │  Child   │
└──────────┘                └──────────┘
     │                           │
     │                           │
     ▼                           ▼
┌──────────┐                ┌──────────┐
│  /ui/    │                │  /ui/    │
│ Button   │                │  Card    │
└──────────┘                └──────────┘

BAD: High Coupling
┌──────────┐ direct import  ┌──────────┐
│ Feature  │ ◄────────────► │ Feature  │
│    A     │                │    B     │
└──────────┘                └──────────┘
     │                           │
     └───────────┬───────────────┘
                 ▼
         ┌──────────────┐
         │ Shared State │
         │   (global)   │
         └──────────────┘
```

### Dependency Direction

```
┌─────────────────────────────────────────────────────────────┐
│                         app/ (pages)                         │
│                      Composes sections                       │
└─────────────────────────────┬───────────────────────────────┘
                              │ imports
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    components/sections/                      │
│                    components/[feature]/                     │
│                  Business logic + UI composition             │
└─────────────────────────────┬───────────────────────────────┘
                              │ imports
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     components/common/                       │
│                      Shared components                       │
└─────────────────────────────┬───────────────────────────────┘
                              │ imports
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       components/ui/                         │
│                    Primitive UI (shadcn)                     │
└─────────────────────────────┬───────────────────────────────┘
                              │ imports
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  lib/ + hooks/ + types/                      │
│                 Utilities, hooks, types                      │
└─────────────────────────────────────────────────────────────┘

RULE: Dependencies flow DOWN only. Never import UP.
```

---

## Component Specifications

### Component Categories

| Category | Location | Purpose | Can Import From |
|----------|----------|---------|-----------------|
| Pages | `app/*/page.tsx` | Route handling, composition | sections, common, ui |
| Sections | `components/sections/` | Page sections | common, ui, hooks, lib |
| Features | `components/[feature]/` | Feature-specific UI | common, ui, hooks, lib |
| Common | `components/common/` | Shared components | ui, hooks, lib |
| UI | `components/ui/` | Primitives (shadcn) | lib only |
| Hooks | `hooks/` | Reusable logic | lib only |
| Lib | `lib/` | Pure utilities | Nothing (leaf) |

### Section Component Spec

Section components are the building blocks of pages.

```typescript
// components/sections/[name]-section.tsx

interface [Name]SectionProps {
  // Optional customization props
  className?: string;
  // Data props if externalized
  data?: SectionData;
}

export function [Name]Section({ className, data }: [Name]SectionProps) {
  // 1. Component is self-contained
  // 2. Data can be internal OR passed as props
  // 3. No side effects outside the component
  // 4. Uses only ui/ and common/ components

  return (
    <section className={cn("py-16 md:py-24", className)}>
      {/* Section content */}
    </section>
  );
}
```

**Requirements:**
- Must be independently testable
- Must render correctly in isolation
- Must not depend on sibling sections
- Should accept `className` for customization

### Feature Component Spec

Feature components encapsulate complex interactive functionality.

```
components/[feature]/
├── index.ts              # Barrel export (REQUIRED)
├── [Feature].tsx         # Main component
├── [Feature]Item.tsx     # Sub-components
├── use-[feature].ts      # Feature-specific hooks (optional)
├── [feature].types.ts    # Feature-specific types (optional)
└── [feature].data.ts     # Feature-specific data (optional)
```

**Example: Neighborhood Map Feature**
```
components/neighborhood-map/
├── index.ts
├── NeighborhoodMap.tsx       # Main map component
├── NeighborhoodMarker.tsx    # Individual markers
├── NeighborhoodTooltip.tsx   # Hover tooltips
├── use-neighborhood.ts       # Selection state hook
├── neighborhood.types.ts     # Neighborhood interface
└── neighborhoods.data.ts     # Static neighborhood data
```

**Barrel Export Pattern:**
```typescript
// components/neighborhood-map/index.ts
export { NeighborhoodMap } from "./NeighborhoodMap";
export { useNeighborhood } from "./use-neighborhood";
export type { Neighborhood } from "./neighborhood.types";
```

---

## Data Specifications

### Data Location Rules

| Data Type | Location | Example |
|-----------|----------|---------|
| UI copy/text | Component or `data/content/` | Headlines, descriptions |
| Feature data | `components/[feature]/[feature].data.ts` | Neighborhood list |
| Shared constants | `lib/constants.ts` | URLs, limits |
| Static assets | `public/data/` | GeoJSON files |
| Environment | `.env` | API keys |

### Data Structure Pattern

```typescript
// data/content/home.ts
export const HOME_CONTENT = {
  hero: {
    title: "Your Soft Landing in Seoul",
    subtitle: "We help expats...",
    cta: {
      primary: "Start Your Journey",
      secondary: "Learn More",
    },
  },
  // ... other sections
} as const;

// Usage in component
import { HOME_CONTENT } from "@/data/content/home";

export function HeroSection() {
  const { title, subtitle, cta } = HOME_CONTENT.hero;
  // ...
}
```

### Type Definitions

```typescript
// types/pricing.ts
export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  highlighted?: boolean;
}

// types/index.ts (barrel export)
export type { PricingTier } from "./pricing";
export type { Neighborhood } from "./neighborhood";
```

---

## State Management Rules

### State Decision Tree

```
Is the state needed across the ENTIRE app?
│
├─ YES → Is it theme/appearance related?
│         ├─ YES → Use next-themes (already set up)
│         └─ NO  → Consider if you REALLY need global state
│                  If yes, create a Context provider
│
└─ NO  → Is it needed by parent + multiple children?
          ├─ YES → Lift state to parent, pass via props
          └─ NO  → Keep in local component (useState)
```

### State Rules

1. **Default to Local State**
   ```typescript
   // PREFER: Local state
   const [isOpen, setIsOpen] = useState(false);
   ```

2. **Lift Only When Necessary**
   ```typescript
   // When 2+ siblings need same state, lift to parent
   function Parent() {
     const [selected, setSelected] = useState(null);
     return (
       <>
         <ChildA selected={selected} onSelect={setSelected} />
         <ChildB selected={selected} />
       </>
     );
   }
   ```

3. **No Prop Drilling Beyond 2 Levels**
   ```typescript
   // BAD: Prop drilling
   <A data={x}> → <B data={x}> → <C data={x}> → <D data={x}>

   // GOOD: Composition or context for deep trees
   ```

4. **No Global State for Local Concerns**
   ```typescript
   // BAD: Global state for form input
   // GOOD: Local useState or react-hook-form
   ```

---

## Adding New Features

### New Page Checklist

```markdown
1. [ ] Create `app/[page-name]/page.tsx`
2. [ ] Create `components/[page-name]/` folder if multiple sections
3. [ ] Add barrel export `components/[page-name]/index.ts`
4. [ ] Use existing common components (Header, Footer)
5. [ ] Follow section component spec
6. [ ] Add page to navigation if needed
```

### New Section Checklist

```markdown
1. [ ] Create in appropriate location:
       - Home section: `components/sections/`
       - Feature section: `components/[page-name]/`
2. [ ] Follow section component spec
3. [ ] Accept `className` prop for flexibility
4. [ ] Use shadcn/ui components where possible
5. [ ] Keep data co-located or in `data/`
```

### New Interactive Feature Checklist

```markdown
1. [ ] Create `components/[feature]/` folder
2. [ ] Add barrel export `index.ts`
3. [ ] Create types file if complex data
4. [ ] Create hook if reusable logic
5. [ ] Add "use client" only to interactive components
6. [ ] Provide fallback for error states
```

---

## Anti-Patterns to Avoid

### Component Anti-Patterns

```typescript
// BAD: God component
function Dashboard() {
  // 500+ lines, handles everything
  // Multiple unrelated features
  // Impossible to test in isolation
}

// GOOD: Composed from focused components
function Dashboard() {
  return (
    <>
      <DashboardHeader />
      <DashboardStats />
      <DashboardChart />
      <DashboardTable />
    </>
  );
}
```

```typescript
// BAD: Feature importing from another feature
import { PricingCard } from "@/components/pricing/PricingCard";
import { FaqItem } from "@/components/faq/FaqItem"; // Cross-feature import!

// GOOD: Import from common or ui only
import { Card } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
```

```typescript
// BAD: Business logic in page.tsx
// app/pricing/page.tsx
export default function PricingPage() {
  const discountedPrice = price * 0.9; // Logic in page!
  const isPopular = tier === "pro";    // More logic!
  // ...
}

// GOOD: Logic in component or hook
// app/pricing/page.tsx
export default function PricingPage() {
  return <PricingSection />;  // Composition only
}
```

### State Anti-Patterns

```typescript
// BAD: Unnecessary global state
const GlobalContext = createContext();
function App() {
  const [modalOpen, setModalOpen] = useState(false); // Local concern!
  return <GlobalContext.Provider value={{ modalOpen }}>...
}

// GOOD: Local state where it belongs
function FeatureWithModal() {
  const [modalOpen, setModalOpen] = useState(false);
  // State stays with the component that uses it
}
```

```typescript
// BAD: Prop drilling
<GrandParent state={x}>
  <Parent state={x}>      // Just passing through
    <Child state={x}>     // Just passing through
      <GrandChild state={x} />  // Actually uses it

// GOOD: Composition pattern
<GrandParent>
  <Parent>
    <Child>
      <ComponentThatNeedsState state={x} />  // Direct prop
```

### Data Anti-Patterns

```typescript
// BAD: Hardcoded data scattered everywhere
function PricingCard() {
  return <div>$99/month</div>;  // Magic number!
}

// GOOD: Centralized data
const PRICING = { pro: { price: 99, interval: "month" } };
function PricingCard({ tier }) {
  return <div>${PRICING[tier].price}/{PRICING[tier].interval}</div>;
}
```

```typescript
// BAD: Fetching in multiple places
function ComponentA() {
  const data = await fetch("/api/data");
}
function ComponentB() {
  const data = await fetch("/api/data"); // Duplicate!
}

// GOOD: Fetch once, pass down
function Parent() {
  const data = await fetch("/api/data");
  return (
    <>
      <ComponentA data={data} />
      <ComponentB data={data} />
    </>
  );
}
```

---

## Checklist for PRs

### Before Submitting

```markdown
## Code Quality
- [ ] No `any` types (use proper TypeScript)
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] No magic numbers/strings (use constants)

## Architecture
- [ ] Components follow single responsibility
- [ ] No cross-feature imports
- [ ] State is at the appropriate level
- [ ] New files are in correct directories

## Conventions
- [ ] File names follow kebab-case
- [ ] Components are PascalCase
- [ ] Imports are properly ordered
- [ ] "use client" only where needed

## Testing
- [ ] Component renders in isolation
- [ ] No broken imports
- [ ] Build passes without errors
```

### Review Questions

Ask yourself:

1. **Cohesion**: Does this component do ONE thing?
2. **Coupling**: Can I change this without changing other components?
3. **Location**: Is this file in the right directory?
4. **Reusability**: If used twice, is it in `common/`?
5. **State**: Is state at the lowest possible level?

---

## Quick Reference

### File Location Decision

```
Need to add code?
│
├─ New page route         → app/[name]/page.tsx
├─ New page section       → components/[page]/[Name]Section.tsx
├─ Shared UI component    → components/common/[name].tsx
├─ Interactive feature    → components/[feature]/
├─ Custom hook            → hooks/use-[name].ts
├─ Utility function       → lib/utils.ts
├─ Type definition        → types/[name].ts
├─ Static content/copy    → data/content/[page].ts
└─ Static asset           → public/[type]/
```

### Import Cheatsheet

```typescript
// UI primitives
import { Button, Card } from "@/components/ui/[name]";

// Common components
import { Header, Footer } from "@/components/common/[name]";

// Features (via barrel)
import { FeatureName } from "@/components/[feature]";

// Hooks
import { useHookName } from "@/hooks/use-[name]";

// Utilities
import { cn, formatDate } from "@/lib/utils";

// Types
import type { TypeName } from "@/types";

// Data
import { DATA_NAME } from "@/data/[name]";
```
