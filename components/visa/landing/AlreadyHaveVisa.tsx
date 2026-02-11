"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisaOption {
  visa: string;
  name: string;
  href: string;
}

interface AlreadyHaveVisaProps {
  visaOptions: VisaOption[];
}

export function AlreadyHaveVisa({ visaOptions }: AlreadyHaveVisaProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border transition-colors",
          isOpen
            ? "border-cyan-500/30 bg-slate-800/60"
            : "border-slate-700/50 hover:border-cyan-500/30"
        )}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-cyan-400" />
          <span className="text-slate-300">Already have a visa?</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
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
        <div className="mt-2 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <p className="text-sm text-slate-400 mb-4">
            Which visa do you have?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visaOptions.map((option) => (
              <Link
                key={option.visa}
                href={option.href}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors group"
              >
                <div>
                  <span className="text-white font-medium">{option.visa}</span>
                  <span className="text-slate-500 text-xs block">
                    {option.name}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
