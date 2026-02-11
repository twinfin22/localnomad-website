"use client";

import { useEffect, useState } from "react";
import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDaysUntil, formatDaysRemaining, getUrgency } from "@/lib/visa/stateMachine";

interface DDayCounterProps {
  targetDate?: Date;
  label?: string;
  className?: string;
}

export function DDayCounter({ targetDate, label = "D-Day", className }: DDayCounterProps) {
  const [days, setDays] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (targetDate) {
      setDays(getDaysUntil(targetDate));
    }
  }, [targetDate]);

  // Update daily
  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      setDays(getDaysUntil(targetDate));
    }, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className={cn("vk-card p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 w-20 bg-[#1F2937] rounded mb-4" />
          <div className="h-12 w-32 bg-[#1F2937] rounded" />
        </div>
      </div>
    );
  }

  const urgency = getUrgency(days);

  const urgencyStyles = {
    critical: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
      icon: AlertTriangle,
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
      icon: AlertTriangle,
    },
    normal: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      glow: "glow-cyan-sm",
      icon: Calendar,
    },
    none: {
      bg: "bg-[#1F2937]",
      border: "border-[#1F2937]",
      text: "text-[#94A3B8]",
      glow: "",
      icon: Calendar,
    },
  };

  const style = urgencyStyles[urgency];
  const IconComponent = style.icon;

  return (
    <div className={cn(
      "vk-card p-6 transition-all duration-300",
      style.glow,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">
          {label}
        </span>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          style.bg
        )}>
          <IconComponent className={cn("w-5 h-5", style.text)} />
        </div>
      </div>

      {days !== null ? (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={cn(
              "text-5xl font-bold font-heading tabular-nums",
              style.text
            )}>
              {Math.abs(days)}
            </span>
            <span className="text-lg text-[#94A3B8]">
              {days < 0 ? "days overdue" : "days"}
            </span>
          </div>
          <p className="text-sm text-[#94A3B8]">
            {formatDaysRemaining(days)}
          </p>

          {urgency === "critical" && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Urgent action required
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <span className="text-lg text-[#94A3B8]">No deadline set</span>
        </div>
      )}
    </div>
  );
}
