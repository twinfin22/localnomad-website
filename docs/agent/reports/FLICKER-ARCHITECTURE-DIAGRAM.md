# LocalNomad UI Flickering - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐      ┌──────────────────┐                        │
│  │  app/layout.tsx  │      │  app/page.tsx    │                        │
│  │  (Root Layout)   │      │  (Home Page)     │                        │
│  │                  │      │  ✓ No flicker    │                        │
│  │ ✓ Dark hardcoded │      │  (Server render) │                        │
│  │ ✓ Font: Geist    │      │                  │                        │
│  │   (display:swap) │      └──────────────────┘                        │
│  └─────────┬────────┘                                                   │
│            │                                                             │
│            ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │         app/[lang]/layout.tsx (Locale Layout)                    │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ • className="dark" (hardcoded dark mode)                         │  │
│  │ • NextIntlClientProvider (i18n)                                  │  │
│  │ • AuthProvider (← ISSUE: async auth state)                      │  │
│  │ • Geist font variable                                            │  │
│  └─────────────┬────────────────────────────────────────────────────┘  │
│               │                                                          │
│               ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   MIDDLEWARE (middleware.ts)                      │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ • URL Rewrite: /korea/visa → /en/korea/visa (internal)         │  │
│  │ • i18n locale from URL or default                                │  │
│  │ • Set NEXT_LOCALE cookie                                         │  │
│  │ • Auth check (redirect to login if protected)                    │  │
│  │ • Detect Accept-Language for suggestion banner                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

                          ▼ BROWSER RENDERS PAGE

┌─────────────────────────────────────────────────────────────────────────┐
│                     HYDRATION & CLIENT RENDERING                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SERVER RENDERED                CLIENT HYDRATED               useEffect │
│  ┌─────────────────────┐    ┌──────────────────┐         ┌──────────┐ │
│  │ isMobile: false     │    │ isMobile: false  │         │ setState │ │
│  │ (no window)         │───▶│ (still false) ✓  │────────▶│ isMobile│ │
│  │                     │    │                  │         │ = true  │ │
│  └─────────────────────┘    └──────────────────┘         └──────────┘ │
│  PROBLEM: Sidebar layout    MATCHES ✓                    FLICKER ✗    │
│  shifts when useEffect      (all good so far)            Layout shift  │
│  runs!                                                                  │
│                                                                          │
│  ┌─────────────────────┐    ┌──────────────────┐         ┌──────────┐ │
│  │ bannerDismissed:    │    │ bannerDismissed: │         │ localStorage
│  │ true (default)      │───▶│ true             │────────▶│ check:   │ │
│  │                     │    │                  │         │ false    │ │
│  └─────────────────────┘    └──────────────────┘         └──────────┘ │
│  PROBLEM: Banner doesn't   MATCHES ✓                    FLICKER ✗    │
│  show on server but        (all good so far)            Banner flashes│
│  appears on client!                                                    │
│                                                                          │
│  ┌─────────────────────┐    ┌──────────────────┐         ┌──────────┐ │
│  │ openStep: null      │    │ openStep: null   │         │ check URL
│  │ (default)           │───▶│                  │────────▶│ hash:    │ │
│  │                     │    │ MATCHES ✓        │         │ openStep │ │
│  └─────────────────────┘    └──────────────────┘         │ = 4      │ │
│  PROBLEM: Accordion        (all good so far)            └──────────┘ │
│  starts closed on           Then scroll with             FLICKER ✗   │
│  server but may be          100ms delay                  Accordion    │
│  open at URL hash           (arbitrary timing)           opens + page │
│                                                           jumps        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Dependency Tree (Where Issues Occur)

```
app/[lang]/layout.tsx
│
├─ AuthProvider
│  │  Problem: Async Supabase call
│  │  • Server: loading = true
│  │  • useEffect: loading → false after auth check
│  │  └─ Impact: Loading spinner flashes on protected pages
│  │
│  └─ children:
│     │
│     ├─ Header
│     │  │
│     │  └─ HeaderMobileMenu
│     │     │  Problem: useIsMobile hook mismatch
│     │     │  • Button and nav state may desync
│     │     └─ Impact: Menu button/nav visibility flashes
│     │
│     ├─ Content (routes)
│     │  │
│     │  ├─ /korea/visa/[type]
│     │  │  └─ DDayCounter
│     │  │     │  Problem: days state initialized to null
│     │  │     │  • Server: days = null → "No deadline set"
│     │  │     │  • useEffect: days = 42 → "42 days"
│     │  │     └─ Impact: Counter content flashes
│     │  │
│     │  ├─ /korea/visa/[type] (Page shows journey)
│     │  │  └─ VisaJourneyPage
│     │  │     │  Problems:
│     │  │     │  1. bannerDismissed state reads from localStorage in useEffect
│     │  │     │     • Server: bannerDismissed = true
│     │  │     │     • useEffect: bannerDismissed = false
│     │  │     │     └─ Impact: Info banner flashes in/out
│     │  │     │
│     │  │     │  2. openStep depends on window.location.hash
│     │  │     │     • Server: openStep = null
│     │  │     │     • useEffect: openStep = 4
│     │  │     │     └─ Impact: Accordion opens on hydration
│     │  │     │
│     │  │     └─ ChecklistStep (rendered inside journey)
│     │  │        │  Problem: Deep linking with hash
│     │  │        │  • Server: isOpen = defaultOpen
│     │  │        │  • useEffect: checks window.location.hash
│     │  │        │  • setTimeout 100ms: scrollIntoView
│     │  │        │  └─ Impact: Accordion snaps open + page jumps
│     │  │
│     │  └─ /korea/areas
│     │     └─ LazySeoulNeighborhoodMap
│     │        │  Problem: Dynamic import with ssr: false
│     │        │  • Server: skips component
│     │        │  • Client: Shows skeleton, then loads map
│     │        │  └─ Impact: Skeleton → map content shift (intentional)
│     │
│     ├─ Sidebar (ui/sidebar.tsx)
│     │  │  Problem: useIsMobile hook
│     │  │  • Server: isMobile = false (or undefined)
│     │  │  • useEffect: isMobile = true (on mobile viewport)
│     │  │  └─ Impact: Sidebar layout shifts
│     │
│     └─ Footer
│        └─ No issues (server-side rendering)
│
└─ styles/globals.css
   │  Dark mode: .dark { ... } hardcoded on HTML
   │  ✓ No flicker (always dark)
   │  ✗ Risk: Future theme toggle will cause flash
```

---

## Request/Response Lifecycle

```
REQUEST: GET /korea/visa

┌─────────────────────────────────┐
│  Middleware (middleware.ts)     │
├─────────────────────────────────┤
│ 1. Parse URL:                   │
│    • locale = "en" (default)    │
│    • country = "korea"          │
│    • path = "/visa"             │
│                                 │
│ 2. Check if rewrite needed:     │
│    • /korea/visa (no locale)    │
│    • needsRewrite = true        │
│                                 │
│ 3. Rewrite internally:          │
│    • /en/korea/visa             │
│                                 │
│ 4. Set cookies:                 │
│    • NEXT_LOCALE = "en"         │
│    • suggested_locale = (from   │
│      Accept-Language header)    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Next.js Router                 │
├─────────────────────────────────┤
│ • Match: /en/korea/visa         │
│ • Found: app/[lang]/[country]   │
│          /visa/page.tsx         │
│                                 │
│ • Generate params:              │
│   - lang = "en"                 │
│   - country = "korea"           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  i18n Request Config            │
├─────────────────────────────────┤
│ (i18n/request.ts)               │
│                                 │
│ 1. Read cookie: NEXT_LOCALE     │
│ 2. Load messages: /messages/en  │
│ 3. Pass to page                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Render Page (Server)           │
├─────────────────────────────────┤
│ 1. Layout renders:              │
│    • dark class on HTML         │
│    • AuthProvider wraps         │
│    • Next.IntlClientProvider    │
│                                 │
│ 2. Page component renders:      │
│    • All data fetched on server │
│    • useState initializes       │
│    • useEffect NOT YET RUN      │
│                                 │
│ 3. Components render:           │
│    • Sidebar: mobile=false      │
│    • DDayCounter: days=null     │
│    • Banner: dismissed=true     │
│    • Accordion: open=false      │
│                                 │
│ 4. CSS sent:                    │
│    • globals.css (dark theme)   │
│    • Tailwind CSS               │
│    • Font: Geist (display:swap) │
└────────┬────────────────────────┘
         │
    SEND HTML + CSS + FONTS
         │
         ▼
┌─────────────────────────────────┐
│  Browser Paints (FART)          │
├─────────────────────────────────┤
│ • Downloads HTML                │
│ • Paints desktop layout         │
│ • Loads fonts (Geist with swap) │
│ • No font flash (display:swap)  │
│ • Loads CSS (Tailwind)          │
└────────┬────────────────────────┘
         │
    SENDS NEXT.JS JS CHUNK
         │
         ▼
┌─────────────────────────────────┐
│  Browser Hydrates               │
├─────────────────────────────────┤
│ • Initializes React             │
│ • Hydrates with same state:     │
│   - mobile=false ✓              │
│   - days=null ✓                 │
│   - banner=true ✓               │
│   - accordion=false ✓           │
│                                 │
│ • Matches server render ✓       │
│ • Attaches event listeners      │
│ • useState hooks created        │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Browser Runs useEffect         │
├─────────────────────────────────┤
│ • mobile detection:             │
│   • window.matchMedia check     │
│   • setMobile(true) ← CHANGE ✗  │
│                                 │
│ • banner check:                 │
│   • localStorage.getItem()      │
│   • setBannerDismissed(false)   │
│     ← CHANGE ✗                  │
│                                 │
│ • hash check:                   │
│   • window.location.hash        │
│   • setOpenStep(4) ← CHANGE ✗   │
│   • setTimeout scroll           │
│     ← PAGE JUMP ✗               │
│                                 │
│ • auth check:                   │
│   • Supabase.auth.getSession()  │
│   • setLoading(false) ← CHANGE ✗│
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  React Reconciliation + Paint   │
├─────────────────────────────────┤
│ • Detect state changes          │
│ • Re-render affected components │
│ • Update DOM:                   │
│   ✗ Sidebar layout shifts       │
│   ✗ Counter updates             │
│   ✗ Banner appears              │
│   ✗ Accordion opens             │
│   ✗ Page scrolls                │
│   ✗ Loading state changes       │
│                                 │
│ BROWSER PAINTS AGAIN            │
│ ✗✗✗ MULTIPLE FLICKERS ✗✗✗       │
└─────────────────────────────────┘
```

---

## Data Flow Comparison: Before vs After Fixes

### Before Fixes (Current Broken State)

```
Request → Middleware → Server Render → HTML + CSS
                                         ↓
                            Browser Paints (mobile=false)
                                         ↓
                        React Hydrates (mobile=false)
                                         ↓
                        useEffect Runs (setMobile=true)
                                         ↓
                    React Re-renders (layout shifts)
                                         ↓
                        Browser Paints AGAIN
                                         ↓
                              ✗ FLICKER ✗
```

### After Fixes (Corrected State)

```
Request → Middleware → Server Render → HTML + CSS
                                         ↓
                            Browser Paints (mobile=false)
                                         ↓
                        React Hydrates (mobile=false)
                                         ↓
                        useEffect Runs (setMobile=true)
                                         ↓
                    React Re-renders (minor style updates only)
                                         ↓
                        Browser Paints (minimal change)
                                         ↓
                              ✓ NO FLICKER ✓
```

---

## CSS Architecture

```
styles/globals.css
│
├─ @import 'tailwindcss'
│  └─ Tailwind CSS framework
│
├─ @import 'tw-animate-css'
│  └─ Custom animations
│
├─ @custom-variant dark (&:is(.dark *))
│  └─ Define dark mode variant
│
├─ :root { --background, --foreground, ... }
│  └─ Light theme CSS variables
│
├─ .dark { --background, --foreground, ... }
│  └─ Dark theme CSS variables (overrides :root)
│
└─ @layer base { body { @apply bg-background ... } }
   └─ Apply theme to body

ISSUE: .dark class hardcoded on HTML element
      → No way to switch themes without JS
      → Future theme switcher will need to be careful
```

---

## Font Loading Pipeline

```
1. app/[lang]/layout.tsx imports Geist
   └─ const geist = Geist({ subsets: ["latin"], display: "swap" })

2. HTML includes font variable
   └─ <body className={`${fontVariables} font-sans`}>

3. Tailwind references font
   └─ --font-sans: 'Geist', 'Geist Fallback'

4. Browser loads fonts in parallel
   └─ Geist (Google Fonts CDN)

5. display: "swap" applied
   └─ Show fallback immediately (system fonts)
   └─ Swap to Geist when ready

✓ NO FOUT (Flash of Unstyled Text)
✓ NO FOIT (Flash of Invisible Text)
✓ NO FONT FLICKER
```

---

## Problem vs Solution Matrix

| Component | Problem | Root Cause | Solution | Impact |
|---|---|---|---|---|
| useIsMobile | state=undefined→false | Initializes undefined | Init to false | High (fixes sidebar) |
| DDayCounter | null→value flash | State init before useEffect | Lazy init value | Medium |
| VisaJourneyPage | localStorage check | useEffect reads storage | Combine effects + hydrated flag | High (fixes banner) |
| ChecklistStep | Hash changes state | Deep link in useEffect | Lazy init checks hash | High (fixes accordion) |
| SeoulNeighborhoodMap | Skeleton→map flash | ssr:false dynamic import | Intentional, expected UX | Medium |
| AuthProvider | Loading→auth flash | Async Supabase call | suppressHydrationWarning | Medium |
| HeaderMobileMenu | Button/nav mismatch | useIsMobile hook | Fixed by #1 | Low |

---

## Critical Path Dependencies

```
For flicker to be ELIMINATED:

Fix #1 (useIsMobile)
    ↓
Fix #4 (ChecklistStep)        (independent)
    ↓
Fix #3 (VisaJourneyPage)      (independent)
    ↓
Fix #2 (DDayCounter)          (independent)
    ↓
Fix #5 (AuthProvider)         (independent)
    ↓
ALL ISSUES RESOLVED ✓

No hard dependencies between fixes.
Can apply in any order, but #1 has highest impact.
```

---

## Deployment Checklist

```
Before Merge:
  □ All fixes implemented
  □ No console hydration warnings
  □ No visible layout shifts
  □ Responsive tests pass
  □ Deep link tests pass
  □ localStorage persistence verified

After Merge:
  □ Deployed to staging
  □ Monitoring alerts configured
  □ Sentry hydration warnings checked
  □ LogRocket session replays reviewed
  □ Real User Monitoring (RUM) baseline established

After Production Deployment:
  □ Monitor hydration errors (should be 0)
  □ Check Web Vitals (CLS should not increase)
  □ User feedback on flickering (should be gone)
  □ Performance metrics (should be same or better)
```

---

## Related Documents

- **FLICKER-ANALYSIS.md** - Detailed line-by-line analysis
- **FLICKER-FIXES.md** - Complete code implementations
- **FLICKER-QUICK-REFERENCE.md** - Summary guide
- **FLICKER-ARCHITECTURE-DIAGRAM.md** - This document
