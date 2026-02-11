"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Send,
  Clock,
  CheckCircle,
  Calendar,
  Upload,
  ExternalLink,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { VisaState } from "@/lib/visa/stateMachine";
import type { VisaType } from "@/lib/visa/types";

interface NextStepHeroProps {
  state: VisaState;
  visaType: VisaType;
  className?: string;
}

interface StepConfig {
  icon: typeof FileText;
  title: string;
  description: string;
  actionLabel: string;
  actionLink?: string;
  externalLink?: string;
  variant: "primary" | "secondary" | "success" | "warning";
}

const stepConfigs: Record<VisaState, StepConfig> = {
  NO_VISA: {
    icon: FileText,
    title: "Find Your Visa",
    description: "Take our quick quiz to discover the best visa for your situation.",
    actionLabel: "Start Quiz",
    actionLink: "/visa/start",
    variant: "primary",
  },
  PREPARING: {
    icon: Upload,
    title: "Prepare Your Documents",
    description: "Gather and upload the required documents for your application.",
    actionLabel: "View Checklist",
    actionLink: "/visa/dashboard",
    variant: "primary",
  },
  SUBMITTED: {
    icon: Send,
    title: "Application Submitted",
    description: "Your application is in the queue. You'll be notified when review begins.",
    actionLabel: "Track Status",
    actionLink: "/visa/dashboard",
    variant: "secondary",
  },
  UNDER_REVIEW: {
    icon: Clock,
    title: "Under Review",
    description: "Immigration is reviewing your application. This typically takes 2-4 weeks.",
    actionLabel: "Check HiKorea",
    externalLink: "https://www.hikorea.go.kr",
    variant: "secondary",
  },
  APPROVED: {
    icon: CheckCircle,
    title: "Congratulations! Approved",
    description: "Your visa has been approved. Prepare for your journey to Korea.",
    actionLabel: "Next Steps",
    actionLink: "/visa/dashboard",
    variant: "success",
  },
  ACTIVE: {
    icon: Calendar,
    title: "Visa Active",
    description: "You're all set! Remember to track important dates and renewals.",
    actionLabel: "View Timeline",
    actionLink: "/visa/dashboard",
    variant: "success",
  },
  EXPIRING: {
    icon: Zap,
    title: "Renewal Required Soon",
    description: "Your visa is expiring. Start the renewal process now to avoid issues.",
    actionLabel: "Start Renewal",
    actionLink: "/visa/dashboard",
    variant: "warning",
  },
  EXPIRED: {
    icon: FileText,
    title: "Visa Expired",
    description: "Your visa has expired. Start a new application or explore other options.",
    actionLabel: "New Application",
    actionLink: "/visa/start",
    variant: "warning",
  },
};

const variantStyles = {
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    iconBg: "bg-primary",
    iconText: "text-background",
    button: "bg-primary hover:bg-accent-hover text-background",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.2)]",
  },
  secondary: {
    bg: "bg-surface",
    border: "border-elevated",
    iconBg: "bg-elevated",
    iconText: "text-primary",
    button: "bg-elevated hover:bg-surface text-foreground",
    glow: "",
  },
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500",
    iconText: "text-background",
    button: "bg-emerald-500 hover:bg-emerald-600 text-background",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    iconBg: "bg-amber-500",
    iconText: "text-background",
    button: "bg-amber-500 hover:bg-amber-600 text-background",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.2)]",
  },
};

export function NextStepHero({ state, visaType, className }: NextStepHeroProps) {
  const config = stepConfigs[state];
  const styles = variantStyles[config.variant];
  const IconComponent = config.icon;

  const ActionButton = () => {
    const buttonContent = (
      <>
        {config.actionLabel}
        {config.externalLink ? (
          <ExternalLink className="w-4 h-4 ml-2" />
        ) : (
          <ArrowRight className="w-4 h-4 ml-2" />
        )}
      </>
    );

    if (config.externalLink) {
      return (
        <a
          href={config.externalLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className={cn("font-semibold", styles.button)}>
            {buttonContent}
          </Button>
        </a>
      );
    }

    if (config.actionLink) {
      return (
        <Link href={config.actionLink}>
          <Button className={cn("font-semibold", styles.button)}>
            {buttonContent}
          </Button>
        </Link>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 sm:p-8 border transition-all",
        styles.bg,
        styles.border,
        styles.glow,
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
            styles.iconBg
          )}
        >
          <IconComponent className={cn("w-8 h-8", styles.iconText)} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {config.title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {config.description}
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <ActionButton />
        </div>
      </div>
    </div>
  );
}
