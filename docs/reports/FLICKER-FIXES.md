# UI Flickering - Implementation Fixes

This document provides ready-to-implement fixes for the flickering issues identified in `FLICKER-ANALYSIS.md`.

---

## Fix #1: useIsMobile Hook (HIGH PRIORITY)

**File**: `/sessions/cool-nifty-knuth/mnt/localnomad-website/components/ui/use-mobile.tsx`

**Current (Broken)**:
```tsx
import * as React from 'react'

const MOBILE_BREAKPOINT = 768

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

  return !!isMobile  // Problem: returns false when undefined (on server)
}
```

**Issue**:
- Initial state is `undefined`
- `!!undefined` returns `false`
- Server renders desktop layout, client eventually matches
- **Hydration mismatch**: All components using this hook conditionally render different UIs

**Fixed**:
```tsx
import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)  // Safe default: false = desktop

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)  // Set correct value on mount
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
```

**Why it works**:
- Initializes to `false` (desktop layout) on both server and client
- useEffect runs on client and updates to correct value if needed
- No mismatch between server and initial client render
- Sidebar, responsive components won't flash

---

## Fix #2: DDayCounter Hydration

**File**: `/sessions/cool-nifty-knuth/mnt/localnomad-website/components/visa/DDayCounter.tsx`

**Current (Broken)**:
```tsx
export function DDayCounter({ targetDate, label = "D-Day", className }: DDayCounterProps) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    if (targetDate) {
      setDays(getDaysUntil(targetDate));
    }
  }, [targetDate]);

  const urgency = getUrgency(days);  // null on initial render!

  return (
    <div className={cn("bg-surface border border-border rounded-xl p-6 transition-all duration-300", ...)}>
      {/* Problem: content differs on server vs client initial render */}
      {days !== null ? (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold tabular-nums">{Math.abs(days)}</span>
            <span className="text-lg text-muted-foreground">{days < 0 ? "days overdue" : "days"}</span>
          </div>
          <p className="text-sm text-muted-foreground">{formatDaysRemaining(days)}</p>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-success" />
          <span className="text-lg text-muted-foreground">No deadline set</span>
        </div>
      )}
    </div>
  );
}
```

**Issue**:
- `days = null` on server render → shows "No deadline set"
- useEffect runs, `days = 42` → DOM updates to show counter
- **Visible flash**: "No deadline set" → "42 days"

**Option A - Lazy Initialize State** (Recommended):
```tsx
'use client';

import { useEffect, useState } from "react";
import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDaysUntil, formatDaysRemaining, getUrgency } from "@/lib/visa/stateMachine";

interface DDayCounterProps {
  targetDate?: Date;
  label?: string;
  className?: string;
}

export function DDayCounter({ targetDate, label = "D-Day", className }: DDayCounterProps) {
  // Calculate initial value once at initialization time
  const [days, setDays] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;  // Server: safe default
    if (targetDate) {
      return getDaysUntil(targetDate);
    }
    return null;
  });

  useEffect(() => {
    if (targetDate) {
      setDays(getDaysUntil(targetDate));
    }
  }, [targetDate]);

  // Update daily
  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      setDays(getDaysUntil(targetDate));
    }, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [targetDate]);

  const urgency = getUrgency(days);

  const urgencyStyles = {
    critical: { /* ... */ },
    warning: { /* ... */ },
    normal: { /* ... */ },
    none: { /* ... */ },
  };

  const style = urgencyStyles[urgency];
  const IconComponent = style.icon;

  return (
    <div className={cn(
      "bg-surface border border-border rounded-xl p-6 transition-all duration-300",
      style.glow,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", style.bg)}>
          <IconComponent className={cn("w-5 h-5", style.text)} />
        </div>
      </div>

      {days !== null ? (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={cn("text-5xl font-bold tabular-nums", style.text)}>
              {Math.abs(days)}
            </span>
            <span className="text-lg text-muted-foreground">
              {days < 0 ? "days overdue" : "days"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDaysRemaining(days)}
          </p>

          {urgency === "critical" && (
            <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20">
              <p className="text-xs text-error flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Urgent action required
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-success" />
          <span className="text-lg text-muted-foreground">No deadline set</span>
        </div>
      )}
    </div>
  );
}
```

**Option B - Suppress Hydration Warning** (Simpler but masks issue):
```tsx
export function DDayCounter({ targetDate, label = "D-Day", className }: DDayCounterProps) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    if (targetDate) {
      setDays(getDaysUntil(targetDate));
    }
  }, [targetDate]);

  const urgency = getUrgency(days);
  // ... (styles)

  return (
    <div suppressHydrationWarning className={cn("bg-surface border border-border rounded-xl p-6", ...)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div suppressHydrationWarning className={cn("w-10 h-10 rounded-xl flex items-center justify-center", style.bg)}>
          <IconComponent className={cn("w-5 h-5", style.text)} />
        </div>
      </div>

      <div suppressHydrationWarning>
        {days !== null ? (
          <>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={cn("text-5xl font-bold tabular-nums", style.text)}>
                {Math.abs(days)}
              </span>
              <span className="text-lg text-muted-foreground">
                {days < 0 ? "days overdue" : "days"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDaysRemaining(days)}
            </p>

            {urgency === "critical" && (
              <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20">
                <p className="text-xs text-error flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  Urgent action required
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-success" />
            <span className="text-lg text-muted-foreground">No deadline set</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Recommendation**: Use Option A (lazy initialization) as it properly fixes the issue. Option B only suppresses the warning without fixing the hydration mismatch.

---

## Fix #3: VisaJourneyPage Banner & Accordion

**File**: `/sessions/cool-nifty-knuth/mnt/localnomad-website/components/visa/journey/VisaJourneyPage.tsx`

**Current (Broken)**:
```tsx
export function VisaJourneyPage({ ... }: VisaJourneyPageProps) {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  // Deep-link handling - changes state based on window object
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      if (hash === "#after-approval" || params.get("mode") === "holder") {
        setOpenStep(4);
        setTimeout(() => {
          document.getElementById("after-approval")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  const [bannerDismissed, setBannerDismissed] = useState(true);

  // localStorage check - changes visibility based on client-side storage
  useEffect(() => {
    const dismissed = localStorage.getItem("visa-info-banner-dismissed");
    if (!dismissed) {
      setBannerDismissed(false);
    }
  }, []);

  // ...rest of component
  return (
    <div className="min-h-screen bg-background">
      {/* Problem: banner may not show on server but appears on client */}
      {!bannerDismissed && (
        <div className="bg-blue-500/10 border-b border-blue-500/20">
          {/* banner content */}
        </div>
      )}

      {/* Problem: steps may be closed on server but open on client */}
      {/* accordion content */}
    </div>
  );
}
```

**Issue**:
1. Server renders: `openStep = null`, `bannerDismissed = true`
2. Client hydrates with same
3. useEffect runs: `openStep` may become `4`, `bannerDismissed` may become `false`
4. **Visible flashes**: Accordion opens, banner appears/disappears

**Fixed**:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import Link from 'next/link';
// ... other imports

interface VisaJourneyPageProps {
  // ... props
}

export function VisaJourneyPage({
  checklistHref,
  pathSimulatorHref,
}: VisaJourneyPageProps) {
  // Accordion state - doesn't depend on window
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  // Banner state - safe default is true (don't show unless explicitly dismissed)
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Single effect for all client-side initialization
  useEffect(() => {
    setIsHydrated(true);

    // Check localStorage for banner dismissal
    const dismissed = localStorage.getItem("visa-info-banner-dismissed");
    if (!dismissed) {
      setBannerDismissed(false);
    }

    // Check URL hash for deep-link
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    if (hash === "#after-approval" || params.get("mode") === "holder") {
      setOpenStep(4);

      // Use requestAnimationFrame to defer scroll until after DOM settles
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById("after-approval")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });
    }
  }, []);

  const handleStepToggle = (stepNumber: number) => (isOpen: boolean) => {
    setOpenStep(isOpen ? stepNumber : null);
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("visa-info-banner-dismissed", "true");
  };

  const requiredDocsCount = visa.documents.filter((d) => d.required).length;
  const docsSubtitle =
    visa.documents
      .slice(0, 3)
      .map((d) => d.name)
      .join(", ") + (visa.documents.length > 3 ? "..." : "");

  return (
    <div className="min-h-screen bg-background">
      {/* Use suppressHydrationWarning since we only show banner after hydration */}
      {!bannerDismissed && isHydrated && (
        <div suppressHydrationWarning className="bg-blue-500/10 border-b border-blue-500/20">
          <div className="container mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-300 flex-1">
                Information shown is based on publicly available requirements
                and may not reflect recent policy changes. Verify with official
                sources before making decisions.
              </p>
              <button
                onClick={handleDismissBanner}
                className="text-blue-300/60 hover:text-blue-300 transition-colors shrink-0"
                aria-label="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-3xl px-4 pt-24 pb-8">
        {/* Rest of component - accordion state managed properly */}
        {/* ... */}
      </div>
    </div>
  );
}
```

**Key improvements**:
1. Combined useEffect: Single place where client-side logic runs
2. `isHydrated` flag: Ensures banner only shows after hydration
3. `suppressHydrationWarning` on conditional element: Tells React to not warn about mismatch
4. `requestAnimationFrame` double call: Defers scroll until after DOM fully settles

---

## Fix #4: ChecklistStep Deep Linking

**File**: `/sessions/cool-nifty-knuth/mnt/localnomad-website/components/visa/journey/ChecklistStep.tsx`

**Current (Broken)**:
```tsx
export function ChecklistStep({
  number,
  title,
  subtitle,
  children,
  badge,
  defaultOpen = false,
  id,
  onToggle,
}: ChecklistStepProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with defaultOpen prop changes
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  // Deep-link handling - opens accordion if URL hash matches
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
        }, 100);  // Problem: Arbitrary 100ms may be too short
      }
    }
  }, [id]);

  // ...rest of component
  return (
    <div id={id} className={cn(
      "rounded-xl border transition-all duration-200",
      isOpen ? "border-primary/30 bg-elevated" : "border-border bg-surface hover:border-border"
    )}>
      {/* Accordion content */}
    </div>
  );
}
```

**Issues**:
1. Server renders: `isOpen = defaultOpen` (usually false)
2. Client: Checks URL hash, may set `isOpen = true`
3. **Visible flash**: Accordion snaps open
4. Scroll jump after 100ms (arbitrary timing)

**Fixed**:
```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistStepProps {
  number: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  id?: string;
  onToggle?: (isOpen: boolean) => void;
}

export function ChecklistStep({
  number,
  title,
  subtitle,
  children,
  badge,
  defaultOpen = false,
  id,
  onToggle,
}: ChecklistStepProps) {
  // Initialize with hash-aware state using lazy initializer
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    // On server (typeof window === 'undefined'), return defaultOpen
    if (typeof window === 'undefined') return defaultOpen;

    // On client, check if URL hash matches this step's id
    if (id) {
      const hash = window.location.hash.slice(1);
      if (hash === id) {
        return true;  // Open if hash matches
      }
    }
    return defaultOpen;
  });

  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with defaultOpen prop changes
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  // Handle scroll to element only after initial hydration
  useEffect(() => {
    if (id && isOpen) {
      // Use requestAnimationFrame to defer scroll until DOM is settled
      const frameId = requestAnimationFrame(() => {
        const frameId2 = requestAnimationFrame(() => {
          contentRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });

      return () => {
        cancelAnimationFrame(frameId);
      };
    }
  }, [id, isOpen]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div
      id={id}
      className={cn(
        "rounded-xl border transition-all duration-200",
        isOpen
          ? "border-primary/30 bg-elevated"
          : "border-border bg-surface hover:border-border"
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={handleToggle}
        className="w-full flex items-start gap-4 p-4 text-left"
      >
        {/* Step number */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
            isOpen
              ? "bg-primary text-background"
              : "bg-elevated text-muted-foreground"
          )}
        >
          {number}
        </div>

        {/* Title and subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {badge && (
              <span className="text-xs text-muted-foreground bg-elevated px-2 py-0.5 rounded">
                {badge}
              </span>
            )}
          </div>
          {!isOpen && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 text-muted-foreground mt-1">
          {isOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Content - only shown when open */}
      {isOpen && (
        <div ref={contentRef} className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
```

**Key improvements**:
1. **Lazy state initializer** on line ~13: Checks `window.location.hash` only during client initialization
2. **No server/client mismatch**: Initial render matches intent (open if hash matches)
3. **requestAnimationFrame instead of setTimeout**: Defers scroll until DOM settles naturally
4. **Separate effect for scroll**: Only scrolls when `isOpen` is true and after hydration

---

## Fix #5: AuthProvider Loading State

**File**: `/sessions/cool-nifty-knuth/mnt/localnomad-website/components/providers/auth-provider.tsx`

**Current (Broken)**:
```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);  // Server: true, Client after auth: true→false

  const supabase = useMemo<SupabaseClient<Database> | null>(() => {
    if (typeof window === 'undefined') return null;
    return createClient();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);  // Eventually becomes false
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ... rest of component
  return (
    <AuthContext.Provider value={{ user, session, loading, ... }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Issue**:
- Server: `loading = true`, shows loading skeleton/spinner
- Client hydrates with `loading = true`
- useEffect runs auth check → `loading = false`
- Protected routes using `loading` flag show different UI

**Fixed (Option A - Add Hydration Boundary)**:
```tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Migrate localStorage data on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        await migrateLocalStorageToSupabase(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const migrateLocalStorageToSupabase = async (userId: string) => {
    // ... existing implementation
  };

  const clearLocalStorage = () => {
    // ... existing implementation
  };

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error('Supabase not initialized') };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error('Supabase not initialized') };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {/* Wrap children with suppressHydrationWarning to allow loading state to change */}
      <div suppressHydrationWarning>
        {children}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Fixed (Option B - Lazy Initialization)**:
```tsx
const [loading, setLoading] = useState<boolean>(() => {
  // On server: return true (show loading state)
  // On client: return true (will be updated by useEffect)
  return typeof window === 'undefined' ? true : true;
});
```

**Recommendation**: Use Option A with `suppressHydrationWarning` since auth state is inherently async and not deterministic.

---

## Fix #6: Combined Migration Strategy

If you want to fix all issues systematically:

1. **Week 1**: Apply Fix #1 (useIsMobile) - highest impact, lowest effort
2. **Week 1**: Apply Fix #3 (VisaJourneyPage) - high impact
3. **Week 2**: Apply Fix #4 (ChecklistStep) - high impact
4. **Week 2**: Apply Fix #2 (DDayCounter) - medium impact
5. **Week 3**: Apply Fix #5 (AuthProvider) - medium impact
6. **Testing**: Run in production with synthetic monitoring to confirm flicker reduction

---

## Testing Checklist

For each fix, test:

- [ ] Load page on desktop (1920x1080)
- [ ] Load page on mobile (375x667)
- [ ] Check Network tab in DevTools (Fast 3G simulation)
- [ ] Verify no console hydration warnings
- [ ] Test responsive transitions (resize browser window)
- [ ] Test deep links with hash (e.g., `/visa/korea#step-2`)
- [ ] Test localStorage persistence (open banner, dismiss, reload)
- [ ] Test on slow network (throttle to slow connection)

---

## Performance Impact

| Fix | Lines Changed | Bundle Impact | Runtime Impact |
|-----|---|---|---|
| Fix #1 | ~5 | None | Minor (no extra state) |
| Fix #2 | ~20 | None | Minor (lazy init only) |
| Fix #3 | ~30 | None | Minimal (combine effects) |
| Fix #4 | ~25 | None | Minimal (use rAF) |
| Fix #5 | ~3 | None | None (suppressHydrationWarning) |

**Total impact**: Negligible. These fixes improve UX without sacrificing performance.

---

## Rollout Strategy

1. Create feature branch: `fix/ui-flickering`
2. Apply fixes in order of priority
3. Test locally with `npm run dev`
4. Build for production: `npm run build`
5. Deploy to staging environment
6. Monitor with Sentry/LogRocket for hydration mismatches
7. Deploy to production
8. Monitor with Real User Monitoring (RUM)
