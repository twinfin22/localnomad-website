"use client";

import type { VisaInfo } from "@/lib/visa/types";
import { AlertCircle, Clock, ExternalLink } from "lucide-react";

interface StepApplyProps {
  visa: VisaInfo;
}

export function StepApply({ visa }: StepApplyProps) {
  // Extract process-related warnings
  const processWarnings =
    visa.warnings?.filter(
      (w) =>
        w.toLowerCase().includes("work") ||
        w.toLowerCase().includes("start") ||
        w.toLowerCase().includes("deport") ||
        w.toLowerCase().includes("illegal") ||
        w.toLowerCase().includes("violation")
    ) || [];

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {visa.applicationSteps.map((step, index) => (
          <div key={step.id} className="flex gap-4 relative">
            {/* Vertical line */}
            {index < visa.applicationSteps.length - 1 && (
              <div className="absolute left-3 top-8 w-px h-[calc(100%-1rem)] bg-border" />
            )}

            {/* Step number circle */}
            <div className="flex-shrink-0 relative z-10">
              <div className="w-6 h-6 rounded-full bg-elevated flex items-center justify-center text-xs text-muted-foreground font-medium">
                {index + 1}
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-foreground">{step.title}</h4>
                {step.duration && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {step.duration}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>

              {/* Step tips */}
              {step.tips && step.tips.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {step.tips.map((tip) => (
                    <li key={tip} className="text-xs text-muted-foreground">
                      • {tip}
                    </li>
                  ))}
                </ul>
              )}

              {/* Step links */}
              {step.links && step.links.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {step.links.map((link, i) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent-hover"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {processWarnings.length > 0 && (
        <div className="space-y-2">
          {processWarnings.map((warning) => (
            <div
              key={warning}
              className="flex gap-2 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Processing time note */}
      {visa.processingTime.notes && (
        <p className="text-xs text-muted-foreground">{visa.processingTime.notes}</p>
      )}
    </div>
  );
}
