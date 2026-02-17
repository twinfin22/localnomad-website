"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { PathStepDetail } from "@/lib/visa/path-data";

interface PathCardProps {
  step: PathStepDetail;
  position: 'first' | 'middle' | 'last';
  stepNumber: number;
  totalSteps: number;
  detailHref?: string;
}

export function PathCard({
  step,
  position,
  stepNumber,
  totalSteps,
  detailHref,
}: PathCardProps) {
  const [isExpanded, setIsExpanded] = useState(position === 'first');
  const t = useTranslations("pathSimulator");

  return (
    <div className="relative">
      {/* Connecting line between cards */}
      {position !== 'first' && (
        <div className="flex justify-center mb-3">
          <div className="flex flex-col items-center">
            <div className="w-px h-6 bg-border" />
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="w-px h-3 bg-border" />
          </div>
        </div>
      )}

      <Card
        className={cn(
          "transition-all duration-200 cursor-pointer overflow-hidden",
          "hover:border-primary/30",
          isExpanded && "border-primary/40 shadow-lg"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Card Header */}
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {/* Step number indicator */}
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                  position === 'first'
                    ? "bg-primary/20 text-primary"
                    : position === 'last'
                      ? "bg-success/20 text-success"
                      : "bg-elevated text-muted-foreground"
                )}
              >
                {stepNumber}
              </div>

              <div className="min-w-0">
                {/* Visa code badge + name */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="font-mono font-bold uppercase text-primary border-primary/30"
                  >
                    {step.visaType}
                  </Badge>
                  <span className="text-base font-semibold text-foreground">
                    {step.visaName}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{step.duration}</span>
                </div>
              </div>
            </div>

            {/* Expand indicator */}
            <button
              type="button"
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Brief description always visible */}
          <p className="text-sm text-muted-foreground mt-3 pl-11">
            {step.description}
          </p>
        </div>

        {/* Expandable content */}
        <CardContent
          className={cn(
            "overflow-hidden transition-all duration-300",
            isExpanded
              ? "max-h-[800px] opacity-100 pt-4"
              : "max-h-0 opacity-0 pt-0"
          )}
        >
          <div className="pl-11 space-y-5">
            {/* Requirements */}
            {step.requirements.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {t("requirements")}
                </h5>
                <ul className="space-y-1.5">
                  {step.requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {step.tips.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  {t("tips")}
                </h5>
                <ul className="space-y-1.5">
                  {step.tips.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning/50 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pitfalls */}
            {step.pitfalls.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                  <AlertTriangle className="w-4 h-4 text-error" />
                  {t("commonPitfalls")}
                </h5>
                <ul className="space-y-1.5">
                  {step.pitfalls.map((pitfall) => (
                    <li
                      key={pitfall}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-error/50 flex-shrink-0" />
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer: step indicator + detail link */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {t("stepOf", { current: stepNumber, total: totalSteps })}
              </span>
              {detailHref && (
                <Link
                  href={detailHref}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-accent-hover transition-colors"
                >
                  {t("viewFullGuide", { visa: step.visaType.toUpperCase() })}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
