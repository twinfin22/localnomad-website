'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const PORTAL_ID = 'blog-disclaimer-target';

export function DisclaimerPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(PORTAL_ID));
  }, []);

  if (!target) return null;

  return createPortal(
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex gap-3 text-[13px] leading-relaxed text-gray-500">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
        <div>{children}</div>
      </div>
    </div>,
    target,
  );
}
