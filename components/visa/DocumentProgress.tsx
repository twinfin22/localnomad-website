"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVisaInfo } from "@/lib/visa/data";
import type { VisaType } from "@/lib/visa/types";

interface DocumentProgressProps {
  visaType: VisaType;
  className?: string;
  compact?: boolean;
}

interface ChecklistState {
  [docId: string]: boolean;
}

const STORAGE_KEY_PREFIX = "visa-checklist-";

export function DocumentProgress({ visaType, className, compact = false }: DocumentProgressProps) {
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [expanded, setExpanded] = useState(!compact);
  const [mounted, setMounted] = useState(false);

  const visa = getVisaInfo(visaType);
  const documents = visa?.documents || [];
  const requiredDocs = documents.filter((d) => d.required);
  const optionalDocs = documents.filter((d) => !d.required);

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${visaType}`);
    if (stored) {
      try {
        setChecklist(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, [visaType]);

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${visaType}`, JSON.stringify(checklist));
    }
  }, [checklist, visaType, mounted]);

  const toggleDocument = (docId: string) => {
    setChecklist((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalRequired = requiredDocs.length;
  const progress = totalRequired > 0 ? (completedCount / totalRequired) * 100 : 0;

  if (!mounted) {
    return (
      <div className={cn("vk-card p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-[#1F2937] rounded mb-4" />
          <div className="h-2 bg-[#1F2937] rounded" />
        </div>
      </div>
    );
  }

  if (!visa) return null;

  return (
    <div className={cn("vk-card overflow-hidden", className)}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-[#1F2937]/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-[#F8FAFC] font-heading">
              Document Checklist
            </h3>
            <p className="text-sm text-[#94A3B8]">
              {completedCount} of {totalRequired} required documents ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Circle */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#1F2937"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#22D3EE"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-cyan-400">
              {Math.round(progress)}%
            </span>
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-[#94A3B8]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Required Documents */}
          <div>
            <h4 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-3">
              Required Documents
            </h4>
            <div className="space-y-2">
              {requiredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => toggleDocument(doc.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all",
                    checklist[doc.id]
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-[#1F2937]/50 border border-transparent hover:border-[#374151]"
                  )}
                >
                  <div className="mt-0.5">
                    {checklist[doc.id] ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#94A3B8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium",
                        checklist[doc.id] ? "text-emerald-400 line-through" : "text-[#F8FAFC]"
                      )}
                    >
                      {doc.name}
                    </p>
                    {doc.description && !checklist[doc.id] && (
                      <p className="text-xs text-[#94A3B8] mt-1">{doc.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Documents */}
          {optionalDocs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-3">
                Optional Documents
              </h4>
              <div className="space-y-2">
                {optionalDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => toggleDocument(doc.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all",
                      checklist[doc.id]
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "bg-[#1F2937]/30 border border-transparent hover:border-[#374151]"
                    )}
                  >
                    <div className="mt-0.5">
                      {checklist[doc.id] ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#64748B]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium",
                          checklist[doc.id] ? "text-emerald-400 line-through" : "text-[#94A3B8]"
                        )}
                      >
                        {doc.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400 font-medium">Pro Tip</p>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Start with documents that take longest to obtain, like apostilled certificates
                  or employer letters.
                </p>
              </div>
            </div>
          </div>

          {/* View Full Details Link */}
          <a
            href={`/visa/${visaType}`}
            className="flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View full visa requirements</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
