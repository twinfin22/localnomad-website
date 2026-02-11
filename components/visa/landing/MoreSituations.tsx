"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Situation } from "./SituationGrid";

interface MoreSituationsProps {
  situations: Situation[];
}

export function MoreSituations({ situations }: MoreSituationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (situations.length === 0) return null;

  return (
    <div className="text-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        {isOpen ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Show fewer situations
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Show more situations
          </>
        )}
      </button>

      {isOpen && (
        <div className="mt-6 p-4 rounded-xl border border-border bg-surface text-left max-w-2xl mx-auto">
          <div className="space-y-1">
            {situations.map((s) => (
              <Link
                key={s.visa}
                href={s.href}
                className="flex items-center justify-between py-3 px-3 -mx-3 hover:bg-elevated rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-muted-foreground">{s.situation}</span>
                </div>
                <span className="text-muted-foreground text-sm">→ {s.visa}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
