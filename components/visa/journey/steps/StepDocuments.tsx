"use client";

import { useState } from "react";
import Link from "next/link";
import type { VisaInfo } from "@/lib/visa/types";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

interface StepDocumentsProps {
  visa: VisaInfo;
  checklistHref: string;
}

export function StepDocuments({ visa, checklistHref }: StepDocumentsProps) {
  const [showAll, setShowAll] = useState(false);

  const requiredDocs = visa.documents.filter((d) => d.required);
  const optionalDocs = visa.documents.filter((d) => !d.required);

  const INITIAL_COUNT = 5;
  const displayedRequired = showAll
    ? requiredDocs
    : requiredDocs.slice(0, INITIAL_COUNT);
  const hasMore = requiredDocs.length > INITIAL_COUNT;

  // Extract document-related tips
  const documentTips =
    visa.tips?.filter(
      (tip) =>
        tip.toLowerCase().includes("document") ||
        tip.toLowerCase().includes("apostille") ||
        tip.toLowerCase().includes("certificate") ||
        tip.toLowerCase().includes("keep") ||
        tip.toLowerCase().includes("notarized") ||
        tip.toLowerCase().includes("translation")
    ) || [];

  return (
    <div className="space-y-6">
      {/* Required documents */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Required
        </h4>
        <div className="space-y-2">
          {displayedRequired.map((doc) => (
            <div key={doc.id} className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground text-sm">{doc.name}</span>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 flex items-center gap-1 text-sm text-primary hover:text-accent-hover"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {requiredDocs.length - INITIAL_COUNT} more
              </>
            )}
          </button>
        )}
      </div>

      {/* Optional documents */}
      {optionalDocs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Optional
          </h4>
          <div className="space-y-2">
            {optionalDocs.map((doc) => (
              <div key={doc.id} className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {documentTips.length > 0 && (
        <div className="space-y-2">
          {documentTips.map((tip, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* View full checklist CTA */}
      <Link
        href={checklistHref}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-elevated text-primary hover:bg-surface transition-colors text-sm"
      >
        View Full Checklist
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  );
}
