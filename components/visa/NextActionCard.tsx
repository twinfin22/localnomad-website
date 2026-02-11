"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Calendar,
  Upload,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { NextAction } from "@/lib/visa/stateMachine";

interface NextActionCardProps {
  action: NextAction;
  className?: string;
}

const priorityStyles = {
  high: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    badge: "bg-primary text-primary-foreground",
    icon: "text-primary",
  },
  medium: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    badge: "bg-warning text-primary-foreground",
    icon: "text-warning",
  },
  low: {
    bg: "bg-elevated",
    border: "border-elevated",
    badge: "bg-surface text-muted-foreground",
    icon: "text-muted-foreground",
  },
};

const actionIcons: Record<string, typeof FileText> = {
  "start-quiz": FileText,
  "complete-checklist": CheckCircle,
  "book-appointment": Calendar,
  "track-status": Clock,
  "pick-up": Upload,
  "arc-check": FileText,
  renew: Calendar,
  restart: FileText,
  wait: Clock,
};

export function NextActionCard({ action, className }: NextActionCardProps) {
  const style = priorityStyles[action.priority];
  const IconComponent = actionIcons[action.id] || FileText;
  const isExternal = action.link?.startsWith("http");

  const CardContent = (
    <div className={cn(
      "group bg-surface border border-border rounded-xl p-6 transition-all duration-300 cursor-pointer",
      action.link && "hover:border-border-hover hover:bg-elevated",
      className
    )}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
          style.bg
        )}>
          <IconComponent className={cn("w-6 h-6", style.icon)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              style.badge
            )}>
              {action.priority === "high" ? "Next Step" : action.priority === "medium" ? "Upcoming" : "Info"}
            </span>
            {action.deadline && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(action.deadline).toLocaleDateString()}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {action.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {action.description}
          </p>

          {action.link && (
            <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
              <span>{isExternal ? "Open Link" : "Go"}</span>
              {isExternal ? (
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (action.link) {
    if (isExternal) {
      return (
        <a href={action.link} target="_blank" rel="noopener noreferrer">
          {CardContent}
        </a>
      );
    }
    return <Link href={action.link}>{CardContent}</Link>;
  }

  return CardContent;
}

interface NextActionsListProps {
  actions: NextAction[];
  className?: string;
}

export function NextActionsList({ actions, className }: NextActionsListProps) {
  if (actions.length === 0) {
    return (
      <div className={cn("bg-surface border border-border rounded-xl p-6 text-center", className)}>
        <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">All Done!</h3>
        <p className="text-sm text-muted-foreground">No pending actions at this time.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {actions.map((action) => (
        <NextActionCard key={action.id} action={action} />
      ))}
    </div>
  );
}
