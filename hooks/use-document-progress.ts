'use client';

import { useState, useEffect } from 'react';

interface DocumentProgress {
  completed: number;
  total: number;
}

export function useDocumentProgress(
  country: string,
  visaType: string,
  totalDocuments: number
): DocumentProgress {
  const storageKey = `localnomad:checklist:${country}:${visaType}`;

  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const readCompleted = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const checkedCount = Object.values(
              parsed as Record<string, boolean>
            ).filter(Boolean).length;
            setCompleted(checkedCount);
            return;
          }
        }
      } catch {
        // localStorage unavailable or invalid JSON
      }
      setCompleted(0);
    };

    readCompleted();

    // Cross-tab updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) readCompleted();
    };

    // Same-tab updates (dispatched by action-zone checklist)
    const handleCustom = () => readCompleted();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('checklist-update', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('checklist-update', handleCustom);
    };
  }, [storageKey]);

  return { completed, total: totalDocuments };
}
