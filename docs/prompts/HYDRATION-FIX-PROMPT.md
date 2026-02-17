# LocalNomad — Hydration Fix + Taiwan Enable + Nav Simplify

CRITICAL overnight prompt. User is asleep. Max 10 hours.

---

## How to Run

```bash
cat docs/HYDRATION-FIX-PROMPT.md | claude --dangerously-skip-permissions -p -
```

IMPORTANT: Use pipe, not $(cat ...).

---

You are the lead engineer for LocalNomad, a Next.js 16 (App Router) + React 19 visa guidance platform at localnomad.club.

## EXECUTION MODE: FULLY UNATTENDED

The user is ASLEEP. You MUST:
- NEVER stop to ask questions. Make reasonable decisions and move on.
- NEVER wait for user confirmation. All decisions are yours.
- If ambiguous, pick the safer/simpler option and document in the commit message.
- If an agent fails, retry ONCE. If it fails again, log the failure and continue.
- If npm run build fails, fix it yourself.
- Complete ALL phases. Do not stop early.
- You may change architecture, refactor components, restructure layouts — whatever it takes.
- Commit after each major phase so progress is saved even if you run out of context.

## BEFORE YOU START

Read these files:
- `CLAUDE.md` — conventions, legal bright lines (Korea AND Taiwan), agent team
- `docs/AGENT-TEAM.md` — role definitions
- `app/[lang]/layout.tsx` — root layout (likely source of hydration issues)
- `app/[lang]/[country]/layout.tsx` — country layout (if exists)
- `components/header.tsx` — navigation header
- `components/footer.tsx` — footer

Tech: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Supabase (auth), next-intl (i18n: en, ja, zh-tw), Mapbox GL.

## THREE TASKS (in priority order)

### TASK 1: FIX HYDRATION FLICKERING (HIGHEST PRIORITY — spend up to 6 hours here)
### TASK 2: Enable Taiwan visa dashboard + fix disabled state
### TASK 3: Simplify navigation — remove Bundles/Area Guide, country → visa dashboard directly

---

# ============================================================
# TASK 1: HYDRATION FLICKERING
# This is a PRODUCTION BLOCKER. Pages flash/flicker on navigation.
# Budget: up to 6 hours. Architecture changes OK.
# ============================================================

## PHASE 1: CONFIRM KNOWN CAUSES + FIND REMAINING

We already know 4 confirmed root causes from prior analysis. Your job is to VERIFY these in the actual code, then find any ADDITIONAL causes.

### KNOWN ROOT CAUSES (confirmed by prior analysis):

**CAUSE 1 — Theme Flash (CRITICAL)**:
`app/[lang]/layout.tsx` has `<html lang={lang} className="dark">` hardcoded.
If a `ThemeProvider` (or `ThemePreviewProvider`) also exists, it will try to set the theme
from localStorage on the client side. Server sends `dark` → client JS may remove/change it → FLASH.
Verify: Read `app/[lang]/layout.tsx` and grep for `ThemeProvider|next-themes|useTheme|forcedTheme`.

**CAUSE 2 — Auth State Flash (CRITICAL)**:
`components/providers/auth-provider.tsx` initializes `user` and `session` as `useState(null)`,
then uses `useEffect` to async-fetch the Supabase session. This means:
- SSR renders with `user: null` (logged-out UI)
- Client JS hydrates → useEffect fires → discovers user is logged in → UI re-renders
- Result: "Login" button flickers to "Profile" button; dashboard briefly shows logged-out state.
Verify: Read `components/providers/auth-provider.tsx` and check the initialization pattern.

**CAUSE 3 — Suspense fallback={null} (SEVERE)**:
`app/[lang]/layout.tsx` wraps `<div id="main-content">` with `<Suspense fallback={null}>`.
If ANY child component suspends, the ENTIRE main content disappears (renders null) then reappears.
This causes the whole page to blink out and back.
Verify: Read `app/[lang]/layout.tsx` and check the Suspense boundary.

**CAUSE 4 — Missing suppressHydrationWarning**:
`<html>` tag lacks `suppressHydrationWarning`. Browser extensions (LastPass, Grammarly, etc.)
inject attributes into the DOM, causing React hydration mismatch. React may force a full
client-side re-render, which causes visible flicker.
Verify: Read `app/[lang]/layout.tsx` and check the `<html>` tag.

### ADDITIONAL DIAGNOSIS:

After verifying the 4 known causes, also search for any OTHER issues:

```bash
# Additional patterns to check:
grep -rn 'mounted\|isClient\|hasMounted\|isHydrated' --include='*.tsx' --include='*.ts' | grep -v node_modules
grep -rn 'typeof window\|typeof document' --include='*.tsx' --include='*.ts' | grep -v node_modules
grep -rn '"use client"' --include='*.tsx' --include='*.ts' | grep -v node_modules | grep -v '.next'
grep -rn 'opacity-0\|invisible.*visible' --include='*.tsx' --include='*.ts' | grep -v node_modules
```

### PUPPETEER BEFORE-FIX BASELINE:

Install puppeteer if needed: `npm install puppeteer --save-dev`
Start dev server: `npm run dev &` (wait for localhost:3000)

Write and run a Puppeteer script that:
1. Navigates to localhost:3000/en/korea/visa
2. Takes 5 rapid screenshots at 200ms intervals during page load (to catch the flash)
3. Clicks a link to /en/korea/visa/e-7
4. Takes 5 rapid screenshots at 200ms intervals during navigation
5. Clicks back, takes 5 rapid screenshots
6. Save all to docs/screenshots/hydration-before-*.png
7. Capture `page.on('console')` for hydration warnings
8. Measure CLS (Cumulative Layout Shift) via PerformanceObserver

Read and analyze the screenshots. This is your BEFORE baseline.
Write complete diagnosis to docs/hydration-diagnosis.md.

## PHASE 2: FIX (apply ALL 4 confirmed fixes + any additional)

### Fix 1: Theme Flash — REMOVE ThemeProvider (if dark-only site)

Read `app/[lang]/layout.tsx`. Determine if the site is dark-only:
- If `forcedTheme="dark"` is set, or there is no light mode anywhere:
  1. REMOVE `ThemeProvider` / `ThemePreviewProvider` wrapping entirely
  2. KEEP `<html lang={lang} className="dark">` — this is correct for dark-only
  3. Remove `next-themes` import and any theme toggle buttons
  4. In `globals.css`, ensure dark mode variables are the default (not behind `.dark` selector)
     or keep `.dark` selector if Tailwind 4 requires it

- If the site supports BOTH light and dark:
  1. Use cookie-based theme detection to avoid flash:
     - Read theme preference from cookie in server component
     - Pass it to `<html className={theme}>` server-side
     - ThemeProvider only syncs, never overrides initial server render
  2. Or add a blocking `<script>` in `<head>` before any content:
     ```tsx
     <script dangerouslySetInnerHTML={{ __html: `
       (function() {
         var t = localStorage.getItem('theme') || 'dark';
         document.documentElement.classList.add(t);
       })()
     ` }} />
     ```

### Fix 2: Auth State — Server-side session initialization

Read `components/providers/auth-provider.tsx`. Fix the `useState(null)` → `useEffect` pattern:

Option A (preferred — pass initial state from server):
1. In the server layout (`app/[lang]/layout.tsx`), use `createServerClient` from `@supabase/ssr`
   to read the session from cookies
2. Pass `initialSession` and `initialUser` as props to `AuthProvider`
3. In `AuthProvider`, initialize useState with the server-provided values:
   ```tsx
   const [user, setUser] = useState<User | null>(initialUser)
   const [session, setSession] = useState<Session | null>(initialSession)
   ```
4. The useEffect still runs to set up the auth listener for real-time updates,
   but the INITIAL render now matches between server and client

Option B (simpler — don't render auth-dependent UI until ready):
1. Keep the useEffect pattern but DON'T conditionally render different UI
2. Instead, always render a "neutral" UI that looks the same logged in or out
3. Auth-dependent elements (login button vs profile) use CSS opacity transition

### Fix 3: Suspense fallback — Replace null with skeleton

Read `app/[lang]/layout.tsx`. Find the `<Suspense fallback={null}>` wrapping main content.

Fix:
1. Change `fallback={null}` to a proper skeleton:
   ```tsx
   <Suspense fallback={
     <div className="min-h-screen bg-background">
       <div className="animate-pulse p-8 space-y-4">
         <div className="h-8 bg-muted rounded w-1/3" />
         <div className="h-4 bg-muted rounded w-2/3" />
         <div className="h-4 bg-muted rounded w-1/2" />
       </div>
     </div>
   }>
   ```
2. Better yet: move Suspense AWAY from wrapping the entire page.
   Instead, put Suspense boundaries around SPECIFIC async components:
   ```tsx
   {/* Layout renders immediately */}
   <Header />
   <main id="main-content">
     {children}  {/* Each page's loading.tsx handles its own loading state */}
   </main>
   <Footer />
   ```
3. Remove the wrapping Suspense entirely if each route already has `loading.tsx`
   (which they do — 15 loading.tsx files exist).

### Fix 4: suppressHydrationWarning

In `app/[lang]/layout.tsx`, add `suppressHydrationWarning` to `<html>`:
```tsx
<html lang={lang} className="dark" suppressHydrationWarning>
```
Also add it to `<body>` if browser extensions modify body attributes:
```tsx
<body className={...} suppressHydrationWarning>
```

### Fix 5: Any additional issues found in diagnosis

For any mounted/isClient patterns found in Step 1:
- Remove "use client" from components that don't need it
- Replace `mounted` conditional rendering with CSS transitions
- Split large client components: server wrapper + small client island

For layout components that are "use client":
- Header: server-render the nav links, only the mobile menu toggle needs client JS
- Footer: should be a Server Component (no interactivity needed)

### AFTER ALL FIXES:

1. Run `npm run build` — must pass with 0 errors
2. Run `npm run dev` in background
3. Re-run the Puppeteer screenshot test from Phase 1 Step 3
4. Compare before/after screenshots
5. Verify: NO flash on page load, NO flash on navigation, NO layout shift
6. If flash still exists, repeat diagnosis on the remaining components
7. Kill dev server

Commit:
```bash
git add -A && git commit -m "fix: eliminate hydration flickering — [describe what you changed]"
```

Write findings to docs/hydration-fix-report.md.

---

# ============================================================
# TASK 2: ENABLE TAIWAN VISA DASHBOARD
# The Taiwan dashboard was built but is disabled/unclickable on the site.
# ============================================================

## PHASE 1: DIAGNOSE

1. Read the country selection / hub page. Search for:
```bash
grep -rn 'taiwan\|Taiwan\|tw\|disabled\|coming.soon\|isDisabled\|isActive' --include='*.tsx' --include='*.ts' app/ components/ | grep -v node_modules
```

2. Check routing:
- Does `app/[lang]/taiwan/` directory exist?
- Does `app/[lang]/taiwan/visa/` exist?
- Is there a route guard or redirect blocking Taiwan?

3. Check the country hub (likely `app/[lang]/page.tsx` or `app/[lang]/[country]/page.tsx`):
- Is the Taiwan card rendered with `disabled`, `pointer-events-none`, `opacity-50`, or similar?
- Is there a conditional check like `country === 'korea'` that blocks Taiwan?

4. Check i18n/routing config:
- Is "taiwan" listed as a valid country in the routing config?
- Does middleware allow `/en/taiwan/` paths?

## PHASE 2: FIX

1. Enable the Taiwan country card — remove any `disabled`, `coming-soon`, `opacity-50`, `pointer-events-none` classes or conditions
2. Ensure `/[lang]/taiwan/visa` route works and renders the Taiwan visa dashboard
3. Verify Taiwan-specific disclaimers are present (read CLAUDE.md Taiwan Legal Bright Lines section)
4. Ensure Taiwan features comply with ALL rules in CLAUDE.md:
   - NO match scores, percentages, or match levels
   - NO personalized eligibility statements
   - Disclaimers in English AND Traditional Chinese (繁體中文)
   - Client-side only data processing
5. Run `npm run build` — must pass

Commit:
```bash
git add -A && git commit -m "feat: enable Taiwan visa dashboard — remove disabled state, verify legal compliance"
```

---

# ============================================================
# TASK 3: SIMPLIFY NAVIGATION
# Remove Bundles and Area Guide buttons.
# Country selection → straight to visa dashboard.
# ============================================================

## PHASE 1: DIAGNOSE

1. Read the country hub page (after selecting a country):
```bash
grep -rn 'bundles\|Bundles\|area.guide\|Area Guide\|AreaGuide\|areas' --include='*.tsx' app/ components/ | grep -v node_modules
```

2. Understand current flow:
- User lands on localnomad.club → sees country cards (Korea, Taiwan)
- Clicks Korea → currently shows: Visa Dashboard, Info Bundles, Area Guide
- User wants: Clicks Korea → goes straight to visa dashboard (or shows visa dashboard directly)

## PHASE 2: FIX

1. In the country hub page (e.g., `app/[lang]/[country]/page.tsx` or similar):
   - Remove the "Info Bundles" card/button/link
   - Remove the "Area Guide" card/button/link
   - Either: redirect directly to `/[lang]/[country]/visa` (simplest)
   - Or: show the visa dashboard content directly on the country page

2. In the header navigation:
   - Remove "Bundles" and "Area Guide" nav links if they exist
   - Keep only: Visa, Compare, Dashboard (or similar visa-related links)

3. In the footer:
   - Remove Bundles and Area Guide links if present

4. Do NOT delete the actual bundle/area route files — just remove navigation to them.
   They might be used later.

5. Run `npm run build` — must pass

Commit:
```bash
git add -A && git commit -m "feat: simplify nav — remove Bundles/Area Guide, country → visa dashboard directly"
```

---

# ============================================================
# FINAL: UXR VERIFICATION
# ============================================================

After all 3 tasks, run a final Puppeteer verification:

1. `npm run dev &` (if not already running)
2. Write and run a Puppeteer script:
   - Navigate: localhost:3000 → click Korea → should go to visa page (not hub with 3 cards)
   - Take screenshots at each step (rapid screenshots during transitions to verify no flash)
   - Navigate to Taiwan → should work (not disabled)
   - Navigate back, click around between pages
   - Mobile viewport (390x844): repeat
   - Save all to docs/screenshots/final-*.png
3. Read and analyze screenshots
4. If any issues remain, fix them
5. Kill dev server
6. Final `npm run build && npm run lint`

Commit if there are additional fixes:
```bash
git add -A && git commit -m "fix: final UXR verification fixes"
```

Push to deploy:
```bash
git push origin main
```

Write final report to docs/OVERNIGHT-REPORT.md:
```markdown
# Overnight Run Report

## Task 1: Hydration Fix
- Root causes found: [list]
- Fixes applied: [list]
- Flash eliminated: YES/NO
- Screenshots: docs/screenshots/hydration-*.png

## Task 2: Taiwan Dashboard
- Was disabled because: [reason]
- Fix applied: [what you did]
- Legal compliance verified: YES/NO

## Task 3: Nav Simplification
- Removed: Bundles, Area Guide
- New flow: Country → Visa Dashboard directly
- Header/footer updated: YES/NO

## Build Status
- npm run build: PASS/FAIL
- npm run lint: PASS/FAIL
- Pushed to origin/main: YES/NO
```

---

## GLOBAL RULES

### Files You Must Not Modify
- `components/ui/*` — shadcn/ui managed
- `node_modules/*`
- `.env.local`

### Legal (Korea)
- ✅ CAN: Display requirements, quizzes, calculators, checklists
- ❌ NEVER: "you are eligible", file for users, store HiKorea creds

### Legal (Taiwan — IMPORTANT)
- ❌ NEVER: Show match scores, percentages, or match levels
- ❌ NEVER: Say "you qualify", rank visas by "fit", use the word "consulting" (諮詢)
- ✅ MUST: Disclaimers in English AND Traditional Chinese on every Taiwan page
- ✅ MUST: All user data client-side only (localStorage), never server
- ✅ MUST: State LocalNomad is not a licensed 移民業務機構

### Error Recovery
- Agent fails → retry ONCE. Fails again → log it, move on.
- Build fails → fix yourself. NEVER add ignoreBuildErrors.
- NEVER stop. Complete ALL tasks.
- Commit after each task so progress is saved.
