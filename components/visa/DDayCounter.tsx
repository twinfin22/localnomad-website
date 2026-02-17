import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDaysUntil, formatDaysRemaining, getUrgency } from "@/lib/visa/stateMachine";

interface DDayCounterProps {
  targetDate?: Date;
  label?: string;
  className?: string;
}

export function DDayCounter({ targetDate, label = "D-Day", className }: DDayCounterProps) {
  const days = targetDate ? getDaysUntil(targetDate) : null;
  const urgency = getUrgency(days);

  const urgencyStyles = {
    critical: {
      bg: "bg-error/10",
      border: "border-error/30",
      text: "text-error",
      glow: "shadow-[0_0_20px_rgba(248,113,113,0.2)]",
      icon: AlertTriangle,
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
      icon: AlertTriangle,
    },
    normal: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
      glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)]",
      icon: Calendar,
    },
    none: {
      bg: "bg-elevated",
      border: "border-elevated",
      text: "text-muted-foreground",
      glow: "",
      icon: Calendar,
    },
  };

  const style = urgencyStyles[urgency];
  const IconComponent = style.icon;

  return (
    <div className={cn(
      "bg-surface border border-border rounded-xl p-6 transition-all duration-300",
      style.glow,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
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
              "text-5xl font-bold tabular-nums",
              style.text
            )}>
              {Math.abs(days)}
            </span>
            <span className="text-lg text-muted-foreground">
              {days < 0 ? "days overdue" : "days"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDaysRemaining(days)}
          </p>

          {urgency === "critical" && (
            <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20">
              <p className="text-xs text-error flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Urgent action required
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-success" />
          <span className="text-lg text-muted-foreground">No deadline set</span>
        </div>
      )}
    </div>
  );
}
