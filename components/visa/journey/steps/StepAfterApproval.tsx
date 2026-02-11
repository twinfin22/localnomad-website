"use client";

import Link from "next/link";
import type { VisaInfo } from "@/lib/visa/types";
import {
  Calendar,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface StepAfterApprovalProps {
  visa: VisaInfo;
  dashboardHref: string;
  checklistHref: string;
}

export function StepAfterApproval({
  visa,
  dashboardHref,
  checklistHref,
}: StepAfterApprovalProps) {
  // Warnings relevant to visa holders (job change, address, tax, extension)
  const holderWarnings =
    visa.warnings?.filter(
      (w) =>
        w.toLowerCase().includes("change") ||
        w.toLowerCase().includes("address") ||
        w.toLowerCase().includes("tax") ||
        w.toLowerCase().includes("extension") ||
        w.toLowerCase().includes("report") ||
        w.toLowerCase().includes("renew")
    ) || [];

  return (
    <div className="space-y-6">
      {/* Key tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={dashboardHref}
          className="p-4 rounded-lg bg-elevated border border-border hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Track Expiry</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Set reminders for 90/60/30 day alerts
          </p>
          <span className="text-xs text-primary group-hover:text-accent-hover mt-2 inline-flex items-center gap-1">
            Go to Dashboard <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href={checklistHref}
          className="p-4 rounded-lg bg-elevated border border-border hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <FileCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Document Checklist</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Track what you have and what you need
          </p>
          <span className="text-xs text-primary group-hover:text-accent-hover mt-2 inline-flex items-center gap-1">
            View Checklist <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Important reminders */}
      {holderWarnings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Important reminders
          </h4>
          <div className="space-y-2">
            {holderWarnings.map((warning, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extension & Renewal */}
      {(visa.duration.extension ||
        visa.duration.maxTotal ||
        visa.fees.extension) && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Extension & Renewal
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {visa.duration.extension && (
              <div>
                <span className="text-muted-foreground block">Period</span>
                <p className="text-foreground">{visa.duration.extension}</p>
              </div>
            )}
            {visa.duration.maxTotal && (
              <div>
                <span className="text-muted-foreground block">Max stay</span>
                <p className="text-foreground">{visa.duration.maxTotal}</p>
              </div>
            )}
            {visa.fees.extension && (
              <div>
                <span className="text-muted-foreground block">Fee</span>
                <p className="text-foreground">{visa.fees.extension}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* What's next */}
      {visa.relatedVisas && visa.relatedVisas.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            What's next?
          </h4>
          <p className="text-sm text-muted-foreground">
            Consider:{" "}
            {visa.relatedVisas.map((v, i) => (
              <span key={v}>
                <Link
                  href={`/visa/${v}`}
                  className="text-primary hover:text-accent-hover"
                >
                  {v.toUpperCase()}
                </Link>
                {i < visa.relatedVisas!.length - 1 && " · "}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Practical resources */}
      {visa.officialLinks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Practical resources
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {visa.officialLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-accent-hover"
              >
                {link.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
