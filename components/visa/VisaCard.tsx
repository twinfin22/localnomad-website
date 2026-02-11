"use client";

import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Home,
  Laptop,
  Search,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisaInfo } from "@/lib/visa/types";

interface VisaCardProps {
  visa: VisaInfo;
  compact?: boolean;
  darkMode?: boolean;
}

const categoryIcons = {
  work: Briefcase,
  study: GraduationCap,
  residence: Home,
  "digital-nomad": Laptop,
  "job-seeking": Search,
};

const categoryColors = {
  work: "bg-primary/10 text-primary",
  study: "bg-blue-500/10 text-blue-500",
  residence: "bg-green-500/10 text-green-500",
  "digital-nomad": "bg-accent/10 text-accent",
  "job-seeking": "bg-orange-500/10 text-orange-500",
};

const categoryColorsDark = {
  work: "bg-cyan-500/10 text-cyan-400",
  study: "bg-blue-500/10 text-blue-400",
  residence: "bg-emerald-500/10 text-emerald-400",
  "digital-nomad": "bg-cyan-500/10 text-cyan-400",
  "job-seeking": "bg-amber-500/10 text-amber-400",
};

export function VisaCard({ visa, compact = false, darkMode = false }: VisaCardProps) {
  const Icon = categoryIcons[visa.category] || Briefcase;
  const colorClass = darkMode
    ? (categoryColorsDark[visa.category] || categoryColorsDark.work)
    : (categoryColors[visa.category] || categoryColors.work);

  if (compact) {
    return (
      <Link href={`/visa/${visa.type}`}>
        <div className={cn(
          "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer",
          darkMode
            ? "border-[#1F2937] hover:border-cyan-500/30 hover:bg-[#1F2937]/50"
            : "border-border hover:border-primary/30 hover:bg-muted/50"
        )}>
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold text-sm truncate", darkMode && "text-[#F8FAFC]")}>{visa.shortName}</h3>
            <p className={cn("text-xs truncate", darkMode ? "text-[#94A3B8]" : "text-muted-foreground")}>{visa.tagline}</p>
          </div>
          <ArrowRight className={cn(
            "w-4 h-4 group-hover:translate-x-1 transition-all",
            darkMode ? "text-[#94A3B8] group-hover:text-cyan-400" : "text-muted-foreground group-hover:text-primary"
          )} />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/visa/${visa.type}`}>
      <div className={cn(
        "group relative rounded-2xl p-6 h-full flex flex-col transition-all duration-300 cursor-pointer overflow-hidden",
        darkMode
          ? "bg-[#111827] border border-[#1F2937] hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          : "bg-card border border-border hover:border-primary/30 hover:shadow-lg"
      )}>
        {/* Accent line */}
        <div className={cn(
          "absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          darkMode ? "from-cyan-400 via-cyan-400/50 to-transparent" : "from-primary via-primary/50 to-transparent"
        )} />

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300",
            colorClass
          )}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider",
                darkMode ? "text-[#94A3B8]" : "text-muted-foreground"
              )}>
                {visa.category.replace("-", " ")}
              </span>
            </div>
            <h3 className={cn(
              "text-xl font-semibold font-heading line-clamp-1",
              darkMode && "text-[#F8FAFC]"
            )}>
              {visa.name}
            </h3>
            <p className={cn(
              "text-sm font-medium",
              darkMode ? "text-cyan-400" : "text-primary"
            )}>{visa.shortName}</p>
          </div>
        </div>

        {/* Description */}
        <p className={cn(
          "text-sm mb-4 line-clamp-2 flex-1",
          darkMode ? "text-[#94A3B8]" : "text-muted-foreground"
        )}>
          {visa.tagline}
        </p>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className={cn("w-4 h-4", darkMode ? "text-[#94A3B8]" : "text-muted-foreground")} />
            <span className={darkMode ? "text-[#94A3B8]" : "text-muted-foreground"}>{visa.duration.initial}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {visa.workPermission.allowed ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Work OK</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400">No Work</span>
              </>
            )}
          </div>
        </div>

        {/* Target Audience Preview */}
        <div className="flex flex-wrap gap-1 mb-4">
          {visa.targetAudience.slice(0, 2).map((target, i) => (
            <span
              key={i}
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                darkMode ? "bg-[#1F2937] text-[#94A3B8]" : "bg-muted text-muted-foreground"
              )}
            >
              {target}
            </span>
          ))}
          {visa.targetAudience.length > 2 && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              darkMode ? "bg-[#1F2937] text-[#94A3B8]" : "bg-muted text-muted-foreground"
            )}>
              +{visa.targetAudience.length - 2} more
            </span>
          )}
        </div>

        {/* CTA */}
        <div className={cn(
          "flex items-center justify-between pt-4 border-t",
          darkMode ? "border-[#1F2937]" : "border-border"
        )}>
          <span className={cn(
            "text-sm font-medium group-hover:underline",
            darkMode ? "text-cyan-400" : "text-primary"
          )}>
            View Details
          </span>
          <ArrowRight className={cn(
            "w-4 h-4 group-hover:translate-x-1 transition-transform",
            darkMode ? "text-cyan-400" : "text-primary"
          )} />
        </div>
      </div>
    </Link>
  );
}
