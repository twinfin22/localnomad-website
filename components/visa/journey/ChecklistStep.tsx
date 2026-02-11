"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistStepProps {
  number: number;
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
  onToggle?: (isOpen: boolean) => void;
}

export function ChecklistStep({
  number,
  title,
  subtitle,
  badge,
  children,
  defaultOpen = false,
  id,
  onToggle,
}: ChecklistStepProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with defaultOpen prop changes (for accordion control)
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  // Handle hash-based deep linking
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
          ? "border-cyan-500/30 bg-slate-800/60"
          : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
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
              ? "bg-cyan-500 text-slate-900"
              : "bg-slate-700 text-slate-300"
          )}
        >
          {number}
        </div>

        {/* Title and subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white">{title}</h3>
            {badge && (
              <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                {badge}
              </span>
            )}
          </div>
          {!isOpen && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 text-slate-400 mt-1">
          {isOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 pt-0 ml-12">{children}</div>
      </div>
    </div>
  );
}
