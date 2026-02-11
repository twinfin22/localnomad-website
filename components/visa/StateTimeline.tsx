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
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-elevated" />

          {/* Progress Line */}
          <div
            className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-primary to-accent-hover transition-all duration-500"
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
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.3)]",
                      isPending && "bg-elevated text-muted-foreground",
                      isExpiring && state === "ACTIVE" && "bg-warning text-primary-foreground shadow-[0_0_20px_rgba(251,191,36,0.3)]",
                      isExpired && state === "ACTIVE" && "bg-error text-foreground"
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
                      isCompleted && "text-primary",
                      isCurrent && "text-primary",
                      isPending && "text-muted-foreground",
                      isExpiring && state === "ACTIVE" && "text-warning",
                      isExpired && state === "ACTIVE" && "text-error"
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
            isExpiring ? "bg-warning/10 border-warning/30" : "bg-error/10 border-error/30"
          )}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn(
                "w-5 h-5",
                isExpiring ? "text-warning" : "text-error"
              )} />
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  isExpiring ? "text-warning" : "text-error"
                )}>
                  {isExpiring ? "Visa Expiring Soon" : "Visa Expired"}
                </p>
                <p className="text-xs text-muted-foreground">
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
                  isCurrent && "bg-primary/10 border border-primary/30",
                  isCompleted && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isCompleted && "bg-primary/20 text-primary",
                    isCurrent && "bg-primary text-primary-foreground",
                    isPending && "bg-elevated text-muted-foreground"
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
                      isCompleted && "text-muted-foreground",
                      isCurrent && "text-primary",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {config.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  )}
                </div>
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
