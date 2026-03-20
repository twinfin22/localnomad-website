'use client';

import { useState, useEffect, useCallback } from 'react';

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

export function useLocalChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    typeof window !== 'undefined' ? readChecklist(storageKey) : {}
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setChecked(readChecklist(storageKey));
      }
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
    [storageKey]
  );

  return { checked, toggle };
}
