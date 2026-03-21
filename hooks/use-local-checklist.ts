'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChecklistItem, ChecklistItemState, VisaTier } from '@/lib/types/checklist';

function readChecklist(key: string): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, boolean>;
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to read checklist from localStorage:', error.message);
      }
    }
  }
  return {};
}

export interface UseLocalChecklistOptions {
  country: string;
  tier: VisaTier;
  items: ChecklistItem[];
}

export interface UseLocalChecklistResult {
  checked: Record<string, boolean>;
  toggle: (itemId: string) => void;
  getItemState: (itemId: string) => ChecklistItemState;
  newlyUnlocked: string[];
  clearNewlyUnlocked: () => void;
  tierCounts: Record<VisaTier, number>;
}

export function useLocalChecklist({
  country,
  tier,
  items,
}: UseLocalChecklistOptions): UseLocalChecklistResult {
  const storageKey = `localnomad:checklist:${country}:${tier}`;

  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    typeof window !== 'undefined' ? readChecklist(storageKey) : {}
  );

  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Re-read from storage when storageKey changes (tier/country switch)
  useEffect(() => {
    setChecked(typeof window !== 'undefined' ? readChecklist(storageKey) : {});
  }, [storageKey]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setChecked(readChecklist(storageKey));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  // Build a flat id→item map for dependency lookups
  const itemMap = new Map<string, ChecklistItem>(items.map((item) => [item.id, item]));

  const getItemState = useCallback(
    (itemId: string): ChecklistItemState => {
      if (checked[itemId]) return 'done';
      const item = itemMap.get(itemId);
      if (item?.blockedBy && item.blockedBy.length > 0) {
        const isBlocked = item.blockedBy.some((depId) => !checked[depId]);
        if (isBlocked) return 'blocked';
      }
      return 'actionable';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checked, items]
  );

  const toggle = useCallback(
    (itemId: string) => {
      setChecked((prev) => {
        const next = { ...prev, [itemId]: !prev[itemId] };

        // Gate unlock: when toggling a gate item ON, find newly unblocked items
        const item = itemMap.get(itemId);
        if (item?.isGate && next[itemId]) {
          const newlyUnblockedIds = items
            .filter((i) => {
              if (!i.blockedBy?.includes(itemId)) return false;
              // Was blocked before (prev state), becomes actionable now
              const wasBlocked = i.blockedBy.some((depId) => !prev[depId]);
              const isNowActionable = !i.blockedBy.some((depId) => !next[depId]);
              return wasBlocked && isNowActionable;
            })
            .map((i) => i.id);

          if (newlyUnblockedIds.length > 0) {
            setNewlyUnlocked(newlyUnblockedIds);
          }
        }

        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
          queueMicrotask(() => {
            window.dispatchEvent(new CustomEvent('checklist-update'));
          });
        } catch (error: unknown) {
          if (error instanceof Error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Failed to save checklist to localStorage:', error.message);
            }
          }
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKey, items]
  );

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  // tierCounts: count items per tier across all items
  const tierCounts: Record<VisaTier, number> = { tourist: 0, 'long-term': 0, resident: 0 };
  for (const item of items) {
    for (const t of item.visaTier) {
      tierCounts[t] = (tierCounts[t] ?? 0) + 1;
    }
  }

  return { checked, toggle, getItemState, newlyUnlocked, clearNewlyUnlocked, tierCounts };
}

/**
 * Simple key-based checklist for non-arrival contexts (e.g., visa document checklists).
 * Preserves the original useLocalChecklist(string) API.
 */
export function useSimpleChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    typeof window !== 'undefined' ? readChecklist(storageKey) : {}
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) setChecked(readChecklist(storageKey));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  const toggle = useCallback(
    (itemId: string) => {
      setChecked((prev) => {
        const next = { ...prev, [itemId]: !prev[itemId] };
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
          queueMicrotask(() => {
            window.dispatchEvent(new CustomEvent('checklist-update'));
          });
        } catch {}
        return next;
      });
    },
    [storageKey]
  );

  return { checked, toggle };
}
