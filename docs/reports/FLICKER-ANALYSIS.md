# UI Flickering Analysis - LocalNomad Website

## Executive Summary

The LocalNomad website has **multiple structural sources of UI flickering**, primarily caused by:

1. **Dark mode hardcoded on server** (no theme provider toggle)
2. **Hydration mismatches** from client-side state initialization
3. **Client-side window/localStorage checks** that differ between server and client render
4. **i18n locale rewrites** that may cause redirect/reflow
5. **Dynamic imports with `ssr: false`** causing placeholder flash-to-content
6. **useIsMobile hook** initializing as `undefined` on server
7. **Multiple useEffect hooks** changing visible UI state on mount
8. **Loading skeleton components** causing content shift

---

## Root Causes (Detailed Analysis)

### 1. DARK MODE HARDCODED TO SERVER
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/app/[lang]/layout.tsx`
**Lines**: 55

```tsx
<html lang={lang} className="dark" suppressHydrationWarning>
```

**Problem**:
- The `dark` class is **hardcoded** on the HTML element at build time
- There is **NO ThemeProvider** (checked: `next-themes` is installed but NOT used)
- The CSS in `styles/globals.css` lines 42-75 defines dark mode colors via `.dark { ... }`
- Server renders everything in dark mode, client renders in dark mode
- **BUT**: If users have system preference for light mode, or if a theme switcher is added later, the mismatch will cause a flash

**Impact**:
- Currently no visible flicker because dark is always on
- Risk: Future theme toggle implementations will cause instant flash

**CSS Root Cause**:
`/sessions/cool-nifty-knuth/mnt/b2c-website/styles/globals.css` lines 42-75:
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark color variables ... */
}
```

---

### 2. useIsMobile HOOK - HYDRATION MISMATCH
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/ui/use-mobile.tsx`
**Lines**: 6-19

```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile  // Returns false when undefined!
}
```

**Problem**:
- Server renders with `isMobile = undefined` (no window object)
- `!!isMobile` returns **`false` on server**
- Client hydrates with `isMobile = undefined`, then useEffect runs and sets correct value
- Components using this hook conditionally render different UIs based on mobile state
- Initial server render (mobile layout = false) != initial client render before hydration completes

**Used In**:
- `/sessions/cool-nifty-knuth/mnt/b2c-website/components/ui/sidebar.tsx` line 69: `const isMobile = useIsMobile()`
- Sidebar responds to mobile/desktop state differently

**Visible Impact**:
- Sidebar layout, menu styling, responsive elements may shift when useEffect runs

---

### 3. DDayCounter - STATE INITIALIZED TO NULL
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/DDayCounter.tsx`
**Lines**: 15-21

```tsx
export function DDayCounter({ targetDate, label = "D-Day", className }: DDayCounterProps) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    if (targetDate) {
      setDays(getDaysUntil(targetDate));
    }
  }, [targetDate]);
```

**Problem**:
- Initial render: `days = null`
- Server renders: `{days !== null ? <div>... {Math.abs(days)} ...</div> : <div>No deadline set</div>}`
- Client hydrates with `days = null`, shows "No deadline set"
- useEffect runs, sets `days = 42` (or whatever)
- UI flashes from "No deadline set" → actual days

**Visible Impact**:
- Content flash on pages with D-Day counter (visa dashboard, visa type pages)

---

### 4. VisaJourneyPage - DEEP LINK SCROLL + BANNER STATE
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/journey/VisaJourneyPage.tsx`
**Lines**: 48-76

```tsx
const [openStep, setOpenStep] = useState<number | null>(null);
const [faqsOpen, setFaqsOpen] = useState(false);
const [resourcesOpen, setResourcesOpen] = useState(false);

// Handle deep-link for holder mode (#after-approval or ?mode=holder)
useEffect(() => {
  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    if (hash === "#after-approval" || params.get("mode") === "holder") {
      setOpenStep(4);
      // Scroll to step 4 after a brief delay
      setTimeout(() => {
        document.getElementById("after-approval")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }
}, []);

const [bannerDismissed, setBannerDismissed] = useState(true);

useEffect(() => {
  const dismissed = localStorage.getItem("visa-info-banner-dismissed");
  if (!dismissed) {
    setBannerDismissed(false);
  }
}, []);
```

**Problems**:
1. **Window check inside useEffect** (line 49): Entire conditional is client-only
   - Server renders: `openStep = null, faqsOpen = false, resourcesOpen = false`
   - Client: May set `openStep = 4` depending on URL hash
   - Result: Accordion state differs between server and client

2. **localStorage check** (line 72):
   - Server cannot access localStorage → `bannerDismissed = true` (default)
   - Client reads localStorage → may set `bannerDismissed = false`
   - Banner visibility flashes in/out on mount

3. **Scroll with setTimeout** (line 55-59):
   - Scroll happens 100ms after hydration
   - Visible page jump after initial render

**Visible Impact**:
- Accordion sections open/close on mount
- Info banner appears/disappears
- Page jumps to scroll position

---

### 5. ChecklistStep - HASH-BASED DEEP LINKING
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/journey/ChecklistStep.tsx`
**Lines**: 36-51

```tsx
useEffect(() => {
  if (id && typeof window !== "undefined") {
    const hash = window.location.hash.slice(1);
    if (hash === id) {
      setIsOpen(true);
      // Scroll into view after render
      setTimeout(() => {
        contentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }
}, [id]);
```

**Problem**:
- Server renders: `isOpen = defaultOpen`
- Client: Checks window.location.hash and may change `isOpen` state
- For URLs like `/visa/korea#step-2`, server renders step-2 as closed, client opens it
- Accordion state change on mount
- Scroll jump 100ms after hydration

**Visible Impact**:
- Accordion/collapsible sections snap open after initial render
- Page content jumps to scroll position

---

### 6. SeoulNeighborhoodMap - DYNAMIC IMPORT WITH ssr: false
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/lazy-map.tsx`
**Lines**: 5-42

```tsx
const SeoulNeighborhoodMap = dynamic(
  () =>
    import("@/components/SeoulNeighborhoodMap").then((mod) => ({
      default: mod.SeoulNeighborhoodMap,
    })),
  {
    ssr: false,
    loading: () => (
      <section className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          {/* ... skeleton UI ... */}
          <div className="w-full md:w-2/3 h-[320px] md:h-[480px] bg-muted animate-pulse" />
        </div>
      </section>
    ),
  }
);
```

**Problem**:
- `ssr: false` means server skips this component entirely
- Server renders: `<loading>` skeleton with animated pulse
- Client: Skeleton shows while component loads from JS bundle
- **Important**: Component only renders on client, which needs Mapbox GL JS library
- Skeleton → Map component swap is intentional but causes visible loading state

**Visible Impact**:
- Skeleton loading animation visible for 100-500ms before map renders
- Content shift as skeleton has different height/layout than final map

**Location**: Used in home page or areas page with neighborhood map

---

### 7. MIDDLEWARE i18n REWRITES
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/middleware.ts`
**Lines**: 72-80

```tsx
let response: NextResponse;
let effectiveLocale = parsed.locale;

if (parsed.needsRewrite) {
  // Rewrite /korea/visa → /en/korea/visa internally
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  response = NextResponse.rewrite(url);
  effectiveLocale = defaultLocale;
} else {
  response = NextResponse.next();
}
```

**Problem**:
- Middleware **rewrites** English URLs internally (does NOT redirect)
- Browser URL bar shows `/korea/visa` but Next.js renders `/en/korea/visa`
- This is NOT a redirect (no HTTP 301/302), so **no full page reload**
- But the rewrite + locale cookie may cause brief inconsistency in i18n context
- Locale cookie set (line 83): `NEXT_LOCALE = "en"`

**i18n Locale Resolution**:
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/i18n/request.ts`
**Lines**: 6-12

```tsx
export default getRequestConfig(async () => {
  // Get locale from cookie (set by middleware)
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;

  // Validate and fall back to default
  const locale: Locale =
    localeCookie && isValidLocale(localeCookie) ? localeCookie : defaultLocale;
```

**Problem**:
- Locale determined from cookie set by middleware
- On first visit, cookie might be missing → falls back to defaultLocale
- Subsequent visits: cookie is set, locale consistent
- **No visible flicker currently** because English URLs always resolve to `en`
- **Risk**: If locale detection changes (e.g., Accept-Language banner), mismatch will occur

**Visible Impact**: Minimal if none (rewrite is internal, not a redirect)

---

### 8. AuthProvider - CLIENT-ONLY SUPABASE
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/providers/auth-provider.tsx`
**Lines**: 33-67

```tsx
const supabase = useMemo<SupabaseClient<Database> | null>(() => {
  if (typeof window === 'undefined') return null;
  return createClient();
}, []);

useEffect(() => {
  if (!supabase) {
    setLoading(false);
    return;
  }

  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  });
```

**Problem**:
- Server render: `supabase = null`, `loading = true`, `user = null`
- Client render: `loading` state changes from `true` → `false` after auth session is fetched
- UI protected by `loading` flag may show loading spinner, then actual content
- localStorage migration happens on sign-in (line 62)

**Visible Impact**:
- Loading spinner or skeleton shows briefly on protected pages
- Auth-dependent UI flashes from "unauthenticated" → "authenticated" state

---

### 9. SIDEBAR - STATE PERSISTENCE & MOBILE DETECTION
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/ui/sidebar.tsx`
**Lines**: 69-94

```tsx
const isMobile = useIsMobile()  // Hydration issue (see #2)
const [openMobile, setOpenMobile] = React.useState(false)

// This is the internal state of the sidebar.
const [_open, _setOpen] = React.useState(defaultOpen)
const open = openProp ?? _open
const setOpen = React.useCallback(
  (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === 'function' ? value(open) : value
    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      _setOpen(openState)
    }
    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  },
  [setOpenProp, open],
)
```

**Problems**:
1. **useIsMobile** hook (line 69) has hydration mismatch (see #2)
2. **Cookie persistence** (line 86):
   - Server reads cookie to set initial state? Not clear from code shown
   - If not server-side, sidebar open state differs: server (default) ≠ client (from cookie)
   - Result: Sidebar may appear/disappear on hydration

**Visible Impact**:
- Sidebar layout changes between server render and client
- Mobile menu toggles visibility unexpectedly

---

### 10. HEADER MOBILE MENU - STATE MISMATCH
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/header-mobile-menu.tsx`
**Lines**: 24-41

```tsx
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

return (
  <>
    <button
      className="md:hidden p-2 text-foreground cursor-pointer"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
    >
      {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>

    {/* Mobile menu */}
    {mobileMenuOpen && (
      <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4 ...">
```

**Problem**:
- Initial state: `mobileMenuOpen = false`
- Server renders button (closed), nav not visible
- Client renders same, then useState hook runs
- On narrow viewport, if JS fails or hydration delayed, button/nav states may mismatch

**Visible Impact**:
- Mobile menu button and nav state may desynchronize briefly

---

### 11. LOADING SKELETON COMPONENTS
**Files**:
- `/sessions/cool-nifty-knuth/mnt/b2c-website/app/loading.tsx`
- `/sessions/cool-nifty-knuth/mnt/b2c-website/app/[lang]/loading.tsx`
- `/sessions/cool-nifty-knuth/mnt/b2c-website/app/[lang]/[country]/loading.tsx`

**Example** (`app/loading.tsx` lines 1-32):
```tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border">
        {/* ... */}
      </div>
      {/* Hero skeleton */}
      <div className="container mx-auto px-4 py-20 text-center">
        <Skeleton className="h-12 w-80 mx-auto mb-4" />
      </div>
    </div>
  );
}
```

**Problem**:
- Next.js Suspense fallback (loading.tsx) shows skeleton while page chunk loads
- Server renders page content (not skeleton)
- When page chunk downloads and hydrates, content replaces skeleton
- This is **intentional UX**, but causes visible content shift

**Visible Impact**:
- Skeleton loading state visible for 100-300ms
- Content jumps in place when real page loads
- Especially noticeable on slow networks or Suspense boundaries

---

### 12. CONDITIONAL RENDERING IN PAGES
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/app/[lang]/page.tsx`
**Lines**: 18-65

```tsx
export default async function GlobalLandingPage({ params }: GlobalLandingProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const t = await getTranslations();

  // No window/localStorage checks, all server-side
  // Server renders country cards based on locale...
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header locale={locale} />
      {/* Hero, country cards, footer */}
    </main>
  );
}
```

**Good News**: This page is **properly server-rendered**, no hydration issues
**No flicker here**

---

## Summary Table

| # | Component/File | Issue | Severity | Visible Impact |
|----|---|---|---|---|
| 1 | `app/[lang]/layout.tsx` L55 | Dark mode hardcoded to server | Low | No current flicker (dark always on), risk if theme toggle added |
| 2 | `components/ui/use-mobile.tsx` L6-19 | useIsMobile returns `false` on server | High | Sidebar, responsive elements shift on hydration |
| 3 | `components/visa/DDayCounter.tsx` L15-21 | days state initialized to null | Medium | Counter flashes from "No deadline" → actual days |
| 4 | `components/visa/journey/VisaJourneyPage.tsx` L48-76 | Window/localStorage checks in useEffect | High | Accordion opens, banner flashes, page jumps |
| 5 | `components/visa/journey/ChecklistStep.tsx` L36-51 | Hash-based deep linking in useEffect | High | Accordion snaps open, page jumps |
| 6 | `components/lazy-map.tsx` L5-42 | Dynamic import with ssr: false | Medium | Skeleton → Map content shift (intentional) |
| 7 | `middleware.ts` L72-80 | i18n rewrite (internal, not redirect) | Low | No visible flicker (rewrite not redirect) |
| 8 | `components/providers/auth-provider.tsx` L33-67 | Supabase client initialization in useEffect | High | Loading state on protected pages, user state flash |
| 9 | `components/ui/sidebar.tsx` L69-94 | useIsMobile + cookie persistence | High | Sidebar open state flashes |
| 10 | `components/header-mobile-menu.tsx` L24-41 | Mobile menu state mismatch | Medium | Menu button/nav state may desync |
| 11 | `app/loading.tsx` et al | Suspense + loading skeleton | Medium | Skeleton → content shift (intentional) |
| 12 | Various pages | No issues (proper async server render) | N/A | No flicker |

---

## High-Priority Fixes

### Fix #1: useIsMobile Hook
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/ui/use-mobile.tsx`

**Current**:
```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  React.useEffect(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  }, [])
  return !!isMobile  // false when undefined
}
```

**Solution**: Initialize state with a server-safe default or use `suppressHydrationWarning`:
```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)  // Default to false (mobile-first)

  React.useEffect(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  }, [])

  return isMobile
}
```

**Why**: This ensures server render matches initial client render.

---

### Fix #2: DDayCounter Hydration
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/DDayCounter.tsx`

**Current**:
```tsx
const [days, setDays] = useState<number | null>(null);
useEffect(() => {
  if (targetDate) setDays(getDaysUntil(targetDate));
}, [targetDate]);

return (
  <div>
    {days !== null ? <div>{Math.abs(days)} days</div> : <div>No deadline</div>}
  </div>
);
```

**Solution**: Calculate on server side if possible, or skip rendering until hydration:
```tsx
const [days, setDays] = useState<number | null>(() => {
  if (typeof window !== 'undefined' && targetDate) {
    return getDaysUntil(targetDate);
  }
  return null;
});

useEffect(() => {
  if (targetDate) setDays(getDaysUntil(targetDate));
}, [targetDate]);
```

Or better: Mark component with `suppressHydrationWarning` if safe:
```tsx
<div suppressHydrationWarning>
  {days !== null ? ... : ...}
</div>
```

---

### Fix #3: VisaJourneyPage localStorage/Window
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/journey/VisaJourneyPage.tsx`

**Current** (Lines 48-76):
```tsx
useEffect(() => {
  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    // ... change openStep based on hash
  }
}, []);

useEffect(() => {
  const dismissed = localStorage.getItem("visa-info-banner-dismissed");
  // ... change bannerDismissed
}, []);
```

**Solution**: Use React 18's `useTransition` or `useDeferredValue` to defer state update, OR wrap in `suppressHydrationWarning`:
```tsx
const [bannerDismissed, setBannerDismissed] = useState(true);  // Safe default

useEffect(() => {
  const dismissed = localStorage.getItem("visa-info-banner-dismissed");
  if (!dismissed) {
    setBannerDismissed(false);
  }
}, []);

return (
  <div suppressHydrationWarning>
    {!bannerDismissed && <banner />}
    {/* rest */}
  </div>
);
```

Or prevent banner flash entirely by reading localStorage server-side via cookies (but requires middleware/server component refactor).

---

### Fix #4: AuthProvider Loading State
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/providers/auth-provider.tsx`

**Current** (Lines 29-50):
```tsx
const [loading, setLoading] = useState(true);
useEffect(() => {
  if (!supabase) {
    setLoading(false);
    return;
  }
  supabase.auth.getSession().then(...).finally(() => setLoading(false));
}, [supabase]);
```

**Solution**: Wrap loading UI with `suppressHydrationWarning`:
```tsx
return (
  <AuthContext.Provider value={{ user, session, loading, ... }}>
    <div suppressHydrationWarning>
      {children}
    </div>
  </AuthContext.Provider>
);
```

Or use a proper loading boundary with Suspense (more complex refactor).

---

### Fix #5: Sidebar Mobile State
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/ui/sidebar.tsx`

**Current** (Line 69):
```tsx
const isMobile = useIsMobile()  // Hydration mismatch!
```

**Solution**: Apply Fix #1 to useIsMobile, which will automatically fix sidebar.

---

### Fix #6: Deep Linking Scroll Jump
**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/journey/ChecklistStep.tsx`

**Current** (Lines 36-51):
```tsx
useEffect(() => {
  if (id && typeof window !== "undefined") {
    const hash = window.location.hash.slice(1);
    if (hash === id) {
      setIsOpen(true);
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
}, [id]);
```

**Solution**: Defer scroll until after hydration using a longer delay or `requestAnimationFrame`:
```tsx
useEffect(() => {
  if (id && typeof window !== "undefined") {
    const hash = window.location.hash.slice(1);
    if (hash === id) {
      setIsOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          contentRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      });
    }
  }
}, [id]);
```

Or better: Use `scroll-margin-top` CSS and skip scroll altogether.

---

## CSS Observations

**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/styles/globals.css`

- **Line 1-2**: Imports Tailwind v4 via `@import 'tailwindcss'` and custom animations
- **Lines 6-75**: CSS custom properties (vars) for light/dark themes
- **Line 4**: Custom dark variant: `@custom-variant dark (&:is(.dark *))`
- **Lines 42-75**: `.dark` class selector with dark color overrides

**Good**: No dynamic theme loading, all CSS in one file
**Issue**: Dark class hardcoded, no CSS-in-JS theme switching

---

## Middleware & Routing

**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/middleware.ts`

**Rewrite Logic** (Lines 72-80):
- `/korea/visa` → internally rewrites to `/en/korea/visa`
- User sees `/korea/visa` in URL bar
- No browser redirect, no page reload
- Locale cookie set in response headers

**No HTML flicker from this** because it's an internal rewrite, not a redirect.

---

## Font Loading

**File**: `/sessions/cool-nifty-knuth/mnt/b2c-website/app/[lang]/layout.tsx`
**Lines**: 7, 15-21

```tsx
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",  // ← Good: uses font-display: swap
});
```

**Good**: Uses Next.js `next/font/google` with `display: "swap"`
**Impact**:
- No FOUT (Flash of Unstyled Text) because fallback fonts used immediately
- Geist font swaps in when ready
- No visible flicker from font loading

---

## Next.js Suspense & loading.tsx

**Files**:
- `app/loading.tsx`
- `app/[lang]/loading.tsx`
- `app/[lang]/[country]/loading.tsx`

**Purpose**: Next.js renders these as fallback while page chunk hydrates
**Current behavior**:
1. Server renders page skeleton (from loading.tsx)
2. Next.js streaming sends skeleton to browser
3. Browser shows skeleton (with animate-pulse)
4. Page JS chunk loads and hydrates
5. Real page content replaces skeleton

**Is this intentional?** Yes, this is normal Next.js behavior.
**Can it cause flicker?** Yes, but it's expected UX (loading state).
**Can it be minimized?**
- Reduce page bundle size
- Use incremental static regeneration (ISR)
- Minimize Suspense boundaries
- Preload critical data

---

## Summary of Recommendations

### Immediate (Quick Fixes)
1. ✅ Fix useIsMobile hook to initialize with safe default
2. ✅ Add `suppressHydrationWarning` to banner/accordion components
3. ✅ Wrap auth loading state with `suppressHydrationWarning`
4. ✅ Use `requestAnimationFrame` for deep-link scrolling

### Short-term (Minor Refactors)
5. Add theme provider if theme switcher needed later
6. Move localStorage reads to useEffect in a way that doesn't change visible output
7. Defer non-critical state updates with `useTransition`

### Long-term (Architectural)
8. Consider moving sidebar state to URL query params instead of cookie
9. Use server-side auth state validation to avoid client-side loading flash
10. Evaluate page bundle size and code-split aggressively

---

## Files to Modify (Priority Order)

1. `/sessions/cool-nifty-knuth/mnt/b2c-website/components/ui/use-mobile.tsx` - High impact
2. `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/DDayCounter.tsx` - Medium impact
3. `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/journey/VisaJourneyPage.tsx` - High impact
4. `/sessions/cool-nifty-knuth/mnt/b2c-website/components/visa/journey/ChecklistStep.tsx` - High impact
5. `/sessions/cool-nifty-knuth/mnt/b2c-website/components/ui/sidebar.tsx` - Will be fixed by #1
6. `/sessions/cool-nifty-knuth/mnt/b2c-website/components/providers/auth-provider.tsx` - Medium impact
7. `/sessions/cool-nifty-knuth/mnt/b2c-website/styles/globals.css` - Low impact (doc only)

---

## Conclusion

The flickering is caused by **hydration mismatches** where server and client render different UI states. The root causes are:

1. **Client-side state initialization** (useState with null/undefined)
2. **Window/document/localStorage checks** in useEffect
3. **Mobile detection hook** returning false on server
4. **Deep linking with scroll** after hydration
5. **Auth loading state** from async Supabase calls
6. **Intentional Suspense/loading skeletons** (expected UX, not a bug)

All are fixable with proper `suppressHydrationWarning`, state initialization fixes, and refactoring async effects.
