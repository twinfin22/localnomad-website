# Error Log

Runtime errors encountered during development, with root cause analysis and fixes.
Use this to avoid repeating the same mistakes.

---

## #1 — useSyncExternalStore infinite loop with localStorage

**Date**: 2026-02-20
**Phase**: 1-3 (F-1-D visa detail page)
**File**: `components/visa/action-zone.tsx`
**Severity**: Blocker (page crashes on load)

### Error

```
The result of getServerSnapshot should be cached to avoid an infinite loop
Maximum update depth exceeded.
```

### Root Cause

The subagent used `useSyncExternalStore` for localStorage-backed checklist state to avoid the "setState in useEffect" lint pattern. This hook has a strict contract:

- `getSnapshot()` must return the **same reference** (`===`) when the data hasn't changed
- `getServerSnapshot()` must return a **stable** cached value

The implementation violated both:

```typescript
// BAD: readChecklist() always returns a NEW {} object
const getSnapshot = useCallback(() => {
  void version; // dependency on version state
  return readChecklist(storageKey); // ← new {} every call
}, [storageKey, version]);

// BAD: () => ({}) creates a new object every call
const getServerSnapshot = useCallback(
  (): Record<string, boolean> => ({}), // ← new {} every call
  []
);
```

React calls `getSnapshot()`, gets `{}`, compares with previous `{}` by reference (`===`), sees they're different, re-renders. On re-render, calls `getSnapshot()` again → new `{}` → different → re-render → infinite loop.

The `version` state hack compounded the issue: bumping `version` in `toggle()` recreated the `useCallback`, which re-triggered `useSyncExternalStore`'s subscription cycle.

### Fix

Replaced with the standard `useState` + `useEffect` pattern:

```typescript
function useChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setChecked(readChecklist(storageKey));

    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setChecked(readChecklist(storageKey));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  const toggle = useCallback(
    (docId: string) => {
      setChecked((prev) => {
        const next = { ...prev, [docId]: !prev[docId] };
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey]
  );

  return { checked, toggle };
}
```

Why this works:
- Initial render: `{}` (matches server — no hydration mismatch)
- `useEffect` reads localStorage after mount (client-only)
- `toggle` updates React state AND localStorage in one call (no version hack)
- Cross-tab sync via `StorageEvent` listener

### Lesson

- **Do NOT use `useSyncExternalStore` for localStorage** unless you implement proper snapshot caching (e.g., serialize to JSON string, compare strings, return cached object if equal). The simpler `useState` + `useEffect` pattern is the standard approach and avoids this entire class of bugs.
- `useSyncExternalStore` is designed for external stores with subscription APIs (Redux, Zustand), not for `localStorage` which has no granular change notification.
- When a subagent picks a "clever" approach over the standard pattern, verify the contract requirements are actually met.
