'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, ChevronDown } from 'lucide-react';
import type { Document, VisaType } from '@/lib/visa/types';

interface DocumentPreviewProps {
  documents: Document[];
  visaType: VisaType;
  className?: string;
}

const INITIAL_DISPLAY_COUNT = 5;

export function DocumentPreview({
  documents,
  visaType,
  className,
}: DocumentPreviewProps) {
  const [showAll, setShowAll] = useState(false);
  const requiredDocs = documents.filter((d) => d.required);
  const optionalDocs = documents.filter((d) => !d.required);

  const displayedDocs = showAll ? requiredDocs : requiredDocs.slice(0, INITIAL_DISPLAY_COUNT);
  const hiddenCount = requiredDocs.length - INITIAL_DISPLAY_COUNT;

  return (
    <div id="documents" className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-foreground">Required Documents</h2>
        <span className="text-sm text-muted-foreground">
          {requiredDocs.length} required{optionalDocs.length > 0 && `, ${optionalDocs.length} optional`}
        </span>
      </div>

      {/* Document list - compact vertical */}
      <div className="space-y-1">
        {displayedDocs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface/30 border border-border/50"
          >
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{doc.name}</span>
            {!doc.required && (
              <span className="text-xs text-muted-foreground ml-auto">(optional)</span>
            )}
          </div>
        ))}
      </div>

      {/* Expand button */}
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 px-3 rounded-lg bg-surface/30 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          +{hiddenCount} more documents
        </button>
      )}

      {/* CTA */}
      <Link href={`/visa/checklist/${visaType}`}>
        <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30">
          View Full Checklist
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}
