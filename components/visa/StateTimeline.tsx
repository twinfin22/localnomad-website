"use client";

import {
  Circle,
  FileText,
  Send,
  Clock,
  CheckCircle,
  Shield,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisaState } from "@/lib/visa/stateMachine";
import { stateConfig, stateOrder, getStateIndex } from "@/lib/visa/stateMachine";

interface StateTimelineProps {
  currentState: VisaState;
  className?: string;
  compact?: boolean;
}

const stateIcons: Record<VisaState, typeof Circle> = {
  NO_VISA: Circle,
  PREPARING: FileText,
  SUBMITTED: Send,
  UNDER_REVIEW: Clock,
  APPROVED: CheckCircle,
  ACTIVE: Shield,
  EXPIRING: AlertTriangle,
  EXPIRED: XCircle,
};

// Only show main journey states (exclude EXPIRING and EXPIRED for cleaner timeline)
const timelineStates: VisaState[] = [
  "NO_VISA",
  "PREPARING",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVE",
];

export function StateTimeline({ currentState, className, compact = false }: StateTimelineProps) {
  const currentIndex = getStateIndex(currentState);
  const isExpired = currentState === "EXPIRED";
  const isExpiring = currentState === "EXPIRING";

  // For expired/expiring, show ACTIVE as the last completed state
  const effectiveIndex = isExpired || isExpiring ? 5 : currentIndex;

  return (
    <div className={cn("", className)}>
      {/* Desktop Timeline */}
      <div className={cn("hidden sm:block", compact && "sm:hidden")}>
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-[#1F2937]" />

          {/* Progress Line */}
          <div
            className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
            style={{
              width: `${(effectiveIndex / (timelineStates.length - 1)) * 100}%`,
            }}
          />

          {/* State Points */}
          <div className="relative flex justify-between">
            {timelineStates.map((state, index) => {
              const config = stateConfig[state];
              const IconComponent = stateIcons[state];
              const isCompleted = index < effectiveIndex;
              const isCurrent = index === effectiveIndex && !isExpired && !isExpiring;
              const isPending = index > effectiveIndex;

              return (
                <div
                  key={state}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / timelineStates.length}%` }}
                >
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                      isCompleted && "bg-cyan-500 text-[#0A0E1A]",
                      isCurrent && "bg-cyan-500 text-[#0A0E1A] glow-cyan animate-cyan-glow",
                      isPending && "bg-[#1F2937] text-[#94A3B8]",
                      isExpiring && state === "ACTIVE" && "bg-amber-500 text-[#0A0E1A] shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                      isExpired && state === "ACTIVE" && "bg-red-500 text-[#F8FAFC]"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "mt-3 text-xs font-medium text-center",
                      isCompleted && "text-cyan-400",
                      isCurrent && "text-cyan-400",
                      isPending && "text-[#94A3B8]",
                      isExpiring && state === "ACTIVE" && "text-amber-400",
                      isExpired && state === "ACTIVE" && "text-red-400"
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiring/Expired Warning */}
        {(isExpiring || isExpired) && (
          <div className={cn(
            "mt-6 p-4 rounded-xl border",
            isExpiring ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30"
          )}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn(
                "w-5 h-5",
                isExpiring ? "text-amber-400" : "text-red-400"
              )} />
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  isExpiring ? "text-amber-400" : "text-red-400"
                )}>
                  {isExpiring ? "Visa Expiring Soon" : "Visa Expired"}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  {isExpiring
                    ? "Start your renewal process to maintain your status."
                    : "Your visa has expired. Start a new application process."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Compact Timeline */}
      <div className={cn("sm:hidden", compact && "sm:block")}>
        <div className="space-y-3">
          {timelineStates.map((state, index) => {
            const config = stateConfig[state];
            const IconComponent = stateIcons[state];
            const isCompleted = index < effectiveIndex;
            const isCurrent = index === effectiveIndex && !isExpired && !isExpiring;
            const isPending = index > effectiveIndex;

            if (compact && !isCompleted && !isCurrent) return null;

            return (
              <div
                key={state}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  isCurrent && "bg-cyan-500/10 border border-cyan-500/30",
                  isCompleted && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isCompleted && "bg-cyan-500/20 text-cyan-400",
                    isCurrent && "bg-cyan-500 text-[#0A0E1A]",
                    isPending && "bg-[#1F2937] text-[#94A3B8]"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCompleted && "text-[#94A3B8]",
                      isCurrent && "text-cyan-400",
                      isPending && "text-[#94A3B8]"
                    )}
                  >
                    {config.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-[#94A3B8]">{config.description}</p>
                  )}
                </div>
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
