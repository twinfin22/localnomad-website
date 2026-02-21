# [Analysis] Frontend Design Recommendations — Feb 19, 2026

## Diagnosis: Current State

### What's Working Well
- **Brand color system**: `#1B4965` (Deep Teal Navy) is strong, institutional, and well-implemented with CSS variables for light/dark mode
- **Typography pairing**: Lora (serif) + Inter (sans-serif) matches the brand guide — "Local" in serif, "Nomad" in sans
- **Responsive design**: Mobile-first Tailwind classes, proper breakpoints, good touch targets (88px+ cards)
- **Code architecture**: Server components by default, proper i18n routing, cached data loading
- **Accessibility basics**: Semantic HTML (`<main id="main-content">`), ARIA labels on emoji, good color contrast (18:1 WCAG AAA)
- **Dark mode ready**: Full CSS variable override system defined in globals.css

### What's Generic / Needs Improvement

| Area | Current State | Problem |
|------|--------------|---------|
| **Body font** | Inter | Used on ~40% of AI-generated sites. Functional but forgettable |
| **CJK fonts** | Missing | ja/zh-tw locales fall back to system fonts — broken experience |
| **Backgrounds** | Flat `#FFFFFF` or `#F5F5F5` everywhere | No visual variety between page types |
| **Hero** | Flat `bg-primary` solid color | No depth, gradient, texture, or visual interest |
| **Animations** | `tw-animate-css` imported but unused | Only micro hover effects (2px lift, arrow slide). No entrance or scroll animations |
| **Decorative elements** | None | No illustrations, no visual motifs, no brand-specific graphics |
| **Navigation** | None | No persistent header, no breadcrumbs, no locale switcher UI |
| **Visa detail pages** | 365 lines of data loaded but hidden | Shows only title + "Coming Soon" — the core product is invisible |
| **Country pages** | "Coming Soon" stub | Dead-end — user bounces with no next action |
| **Page differentiation** | All pages identical layout | Landing, country, visa, legal all use same `max-w-3xl px-6 py-16` |
| **Favicon color** | `#1a1a1a` (dark gray) | Should be brand primary `#1B4965` |
| **Accent color** | `#D64045` defined but never used | No visual accent on any page |

### Design System Maturity

| Aspect | Maturity | Notes |
|--------|----------|-------|
| Color system | High | Well-structured, dark mode ready, brand-aligned |
| Typography | Medium | Google Fonts integrated, but Inter is generic and CJK missing |
| Layout/Grid | Medium | Consistent padding/spacing, but only one layout pattern |
| Components | Low | Only 3 shadcn/ui components (Button, Card, Accordion), mostly unused |
| Animation | Low | Library imported, barely used |
| Icons/Assets | Low | Favicon needs fix, no branded illustrations |
| Visual Identity | Low | Clean but forgettable — no distinctive visual language |

---

## Competitive Research Insights

### Key Platforms Analyzed
- **Nomad List / nomads.com**: Card-based grid, emoji metrics, filter-first. High information density. Targets city comparison, NOT legal trust.
- **VisaGuide.World**: Professional blue, two-column layout (70/30), encyclopedia-style. Trustworthy but generic.
- **Boundless Immigration**: Warm serif typography, "From there to here" journey metaphor, emotional design + process transparency. GeekWire UX Design finalist.
- **Immigration law firm sites**: Dark blue primary, short paragraphs, award badges, free consultation CTAs.

### What Makes Visa Sites Feel Trustworthy

| Signal | Trustworthy | Generic |
|--------|------------|---------|
| Color | Deep muted blues/teals (institutional weight) | Bright gradients, stock template colors |
| Typography | Serif headings (authority) + sans body (clarity). Max 2 families | Single generic sans-serif throughout |
| Content | Short paragraphs, scannable lists, clear headings, visible disclaimers | Wall-of-text, hidden disclaimers |
| Source attribution | "Based on [Agency] published requirements, last updated [date]" | No source, no dates |
| Visual metaphor | Journey/path/compass motif tied to brand narrative | Stock photos of airplanes |
| Freshness signals | "Last verified: Feb 2026", version badges | No dates visible |
| White space | Generous padding (2em+), breathing room | Cramped, template-default |
| Interaction | Progressive disclosure (overview first, detail on click) | Everything shown at once |

### CJK Typography Findings (Critical for i18n)
- CJK text requires `line-height: 1.7-1.8` (vs 1.5-1.6 for Latin)
- Latin appears too small at same point size as CJK — choose fonts with harmonized metrics
- Korean needs `word-break: keep-all` to prevent mid-word breaks
- CJK fonts = 10K+ glyphs, 100+ files — must use `preload: false` in Next.js
- Recommended stack: `Noto Sans KR` (Korean) / `Noto Sans TC` (Traditional Chinese), loaded per locale

---

## Recommendations

### 1. Typography Upgrade

#### Option A: Replace Inter with a Distinctive Sans-Serif
Swap Inter for a font with more character:

| Font | Vibe | Why It Works |
|------|------|-------------|
| **DM Sans** | Geometric, modern, slightly rounded | Warm counterpart to Lora's classicism |
| **Outfit** | Clean geometric, wide x-height | Contemporary without being trendy |
| **General Sans** (Fontshare) | Humanist, confident, wider | Editorial quality, pairs beautifully with serifs |

**Effort**: Low (1 font swap in `app/[locale]/layout.tsx`)
**Impact**: Medium — immediately less "template-y"

#### Option B: Keep Inter, Add a Display Font for Impact
Keep Inter for body, introduce a third font for hero headlines and page titles:

| Font | Vibe |
|------|------|
| **Fraunces** | Variable optical-size serif, playful "wonky" axis — memorable |
| **Instrument Serif** | Elegant, editorial, high contrast — sophisticated |
| **Bricolage Grotesque** | Geometric with quirky details — modern but warm |

**Effort**: Low-Medium (add font, apply to specific elements)
**Impact**: High — hero and page titles become distinctive

#### Option C: CJK Font Setup (Recommended regardless of A/B)
- Load `Noto Sans KR` / `Noto Sans TC` conditionally per locale in layout.tsx
- Use `preload: false`
- Add `line-height: 1.8` for CJK locales
- Add `word-break: keep-all` for Korean

**Effort**: Medium
**Impact**: High for non-English users

---

### 2. Color Palette Expansion

#### Option A: Country-Specific Accent Colors
Keep `#1B4965` as universal brand. Add per-country accent:

```
Korea:   --accent-country: #E07A5F  (terracotta — warm, energetic)
Taiwan:  --accent-country: #3D8B6E  (jade green — natural, prosperity)
```

Appears in: hero gradient overlay, CTA buttons, category badges, active tab underlines.

**Effort**: Medium (CSS variables per country context)
**Impact**: High

#### Option B: Warm Up the Neutral Palette
```
Current:  --muted: #F5F5F5   (cool gray)
Proposed: --muted: #FAF8F5   (warm cream)
```

**Effort**: Low (2-3 CSS variable changes)
**Impact**: Medium

#### Option C: Gradient Depth on Hero
```css
/* Current */
background: #1B4965;

/* Proposed */
background: linear-gradient(160deg, #1B4965 0%, #122F42 60%, #0D1F2D 100%);
```

Optional: subtle noise/grain texture overlay.

**Effort**: Low (1 CSS change)
**Impact**: Medium

---

### 3. Visual Motif / Brand Element

#### Option A: Compass Line Motif
Thin decorative line + diamond (matches favicon shape) as recurring element:

```
─── ◇ ───  (section dividers)
     ◇     (bullet points)
  ──◇──    (heading accents)
```

**Effort**: Low (CSS + SVG elements)
**Impact**: High — creates brand recognition

#### Option B: Topographic/Map Pattern
Subtle topo map pattern as background texture:

```css
background-image: url('/patterns/topo.svg');
background-size: 400px;
opacity: 0.05;
```

**Effort**: Medium
**Impact**: Medium

#### Option C: Country Illustrations
Simple line illustrations per country (hanok silhouette for Korea, mountain range for Taiwan).

**Effort**: High (needs illustration work)
**Impact**: High

---

### 4. Animation & Motion

#### Option A: Staggered Entrance Animation (Recommended)
```
Hero headline:  fade-up, 0ms
Hero subtitle:  fade-up, 100ms
Country cards:  fade-up, 200ms + 100ms stagger
```

CSS `@keyframes` + `animation-delay` only. No JS.

**Effort**: Low (10-15 lines CSS)
**Impact**: High

#### Option B: Scroll-Triggered Section Reveals
Sections fade in on scroll via `IntersectionObserver`:
- Start: `opacity: 0; transform: translateY(20px)`
- Animate in with staggered children

**Effort**: Medium (reusable hook + CSS)
**Impact**: Medium

#### Option C: Page Transitions
Crossfade between routes using Next.js View Transitions API (experimental in Next 16).

**Effort**: High (experimental API)
**Impact**: Medium

---

### 5. Layout & Spatial Composition

#### Option A: Visa Detail Two-Column Layout
70/30 split on desktop:

```
┌────────────────────────┬──────────┐
│  Main Content          │ Sidebar  │
│  - Requirements        │ Quick    │
│  - Documents           │ Facts    │
│  - Steps               │ ─────── │
│  - FAQs                │ Links    │
│                        │ Related  │
└────────────────────────┴──────────┘
```

Sidebar: processing time, cost, duration, official links, related visas. Sticky on scroll.
Mobile: sidebar → summary card above fold.

**Effort**: Medium
**Impact**: High

#### Option B: Hero Variation by Page Type
```
Landing:      Full-height, brand navy, centered
Country:      Half-height, gradient + country accent, left-aligned
Visa Detail:  Compact banner, key facts row, breadcrumb
Legal:        Minimal, title + last-updated date
```

**Effort**: Medium (4 hero variants)
**Impact**: High

#### Option C: Visa Card Grid for Country Page
Replace "Coming Soon" with filterable visa cards:

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 🏠 F-1-D    │ │ 💼 E-7      │ │ 🎓 D-2      │
│ Digital      │ │ Employment  │ │ Student      │
│ Nomad        │ │ Visa        │ │ Visa         │
│ 1-2 years   │ │ 1-3 years   │ │ 2-4 years   │
│ ~$66K req   │ │ Sponsor req │ │ Enrollment   │
│ View →       │ │ Coming Soon │ │ Coming Soon  │
└─────────────┘ └─────────────┘ └─────────────┘
```

**Effort**: Medium
**Impact**: High — eliminates dead-end country page

---

### 6. Information Hierarchy / "TL;DR Architecture"

#### Recommendation: Progressive Disclosure Pattern
Every visa page opens with a **summary card** (5-7 key facts), then expands into accordion sections:

```
┌─────────────────────────────────────────────┐
│  Korea Digital Nomad Visa (F-1-D)           │
│  "Work remotely, live in Korea"             │
├─────────────────────────────────────────────┤
│  Duration: 1-2 years │ Cost: ₩120K         │
│  Income: ~$66K/yr    │ Processing: 2-4 wks │
│  Insurance: Required │ Family: Allowed      │
└─────────────────────────────────────────────┘

▼ Eligibility Requirements (4 criteria)
▼ Required Documents (8 items)
▼ Application Steps (6 steps)
▼ FAQs (13 questions)
▼ Related Visas & Transition Paths
```

Uses existing shadcn/ui Accordion component. Each section rendered from the F-1-D JSON data.

**Effort**: Medium (new components, wire existing data)
**Impact**: Critical — this IS the core product

---

### 7. Missing Structural Elements

#### 7a. Persistent Navbar
- Logo (left) → home link
- Breadcrumb on nested pages (Home > Korea > F-1-D)
- Locale switcher (right) — dropdown or segmented control
- Mobile: hamburger menu

#### 7b. "Last Updated" Timestamps
Every visa page shows: `"Data last verified: Feb 2026 · Source: Korea Immigration Service"`
This is the **#1 trust signal** for information platforms.

#### 7c. Favicon Color Fix
Currently `#1a1a1a`. Should be brand `#1B4965`.

---

## Execution Priority

| # | Recommendation | Effort | Impact | Priority |
|---|---------------|--------|--------|----------|
| 6 | Progressive disclosure (visa detail rendering) | Medium | Critical | **P0** |
| 5c | Visa card grid (country page) | Medium | High | **P0** |
| 4a | Staggered entrance animations | Low | High | **P1** |
| 1a/1b | Typography upgrade | Low | Medium-High | **P1** |
| 2c | Hero gradient depth | Low | Medium | **P1** |
| 3a | Compass diamond motif | Low | High | **P1** |
| 5b | Hero variation by page type | Medium | High | **P1** |
| 7a | Persistent navbar | Medium | High | **P1** |
| 2a | Country-specific accent colors | Medium | High | **P2** |
| 2b | Warm neutral palette | Low | Medium | **P2** |
| 1c | CJK font setup | Medium | High (CJK users) | **P2** |
| 7b | "Last updated" timestamps | Low | Medium | **P2** |
| 7c | Favicon color fix | Trivial | Low | **P2** |
| 4b | Scroll-triggered reveals | Medium | Medium | **P3** |
| 3b | Topographic pattern | Medium | Medium | **P3** |
| 3c | Country illustrations | High | High | **P3** |
| 4c | Page transitions | High | Medium | **P3** |

---

## Key Files

| File | Role |
|------|------|
| `app/globals.css` | CSS variables, color palette, theme |
| `app/[locale]/layout.tsx` | Font loading (Inter, Lora), locale layout |
| `components/landing/hero.tsx` | Hero section |
| `components/landing/country-card.tsx` | Country card component |
| `components/footer/footer.tsx` | Footer |
| `app/[locale]/[country]/page.tsx` | Country page (stub) |
| `app/[locale]/[country]/visa/[type]/page.tsx` | Visa detail page (stub) |
| `data/visas/en/f-1-d.json` | F-1-D visa data (365 lines, complete) |
| `lib/visa-data.ts` | Data loader |
| `lib/types/visa.ts` | Visa type definitions |
| `public/favicon.svg` | Favicon (needs color fix) |

## Verification

After implementing any recommendations:
1. `npm run build` — no build errors
2. Visual check on mobile (375px) + desktop (1440px)
3. Lighthouse audit: Performance > 90, Accessibility > 95
4. Dark mode variable check if colors changed
5. CJK rendering test on `/ja` and `/zh-tw` if fonts changed
