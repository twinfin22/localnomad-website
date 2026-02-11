"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, ChevronDown, Route } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisaOption {
  visa: string;
  name: string;
  href: string;
}

interface AlreadyHaveVisaProps {
  visaOptions: VisaOption[];
  pathSimulatorHref?: string;
}

export function AlreadyHaveVisa({ visaOptions, pathSimulatorHref }: AlreadyHaveVisaProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl bg-surface border transition-colors",
          isOpen
            ? "border-primary/30 bg-elevated"
            : "border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground">Already have a visa?</span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <span className="text-sm">Manage your visa</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 p-4 rounded-xl border border-border bg-surface">
          <p className="text-sm text-muted-foreground mb-4">
            Which visa do you have?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visaOptions.map((option) => (
              <Link
                key={option.visa}
                href={option.href}
                className="flex items-center justify-between p-3 rounded-lg bg-elevated hover:bg-surface border border-border hover:border-primary/30 transition-colors group"
              >
                <div>
                  <span className="text-foreground font-medium">{option.visa}</span>
                  <span className="text-muted-foreground text-xs block">
                    {option.name}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          {/* Path simulator link */}
          {pathSimulatorHref && (
            <Link
              href={pathSimulatorHref}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-accent-hover transition-colors"
            >
              <Route className="w-4 h-4" />
              <span>Explore visa transition paths</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
