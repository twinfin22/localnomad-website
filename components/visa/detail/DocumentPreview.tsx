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
        <h2 className="text-xl font-bold text-white">Required Documents</h2>
        <span className="text-sm text-slate-400">
          {requiredDocs.length} required{optionalDocs.length > 0 && `, ${optionalDocs.length} optional`}
        </span>
      </div>

      {/* Document list - compact vertical */}
      <div className="space-y-1">
        {displayedDocs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
          >
            <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-sm text-slate-300">{doc.name}</span>
            {!doc.required && (
              <span className="text-xs text-slate-500 ml-auto">(optional)</span>
            )}
          </div>
        ))}
      </div>

      {/* Expand button */}
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 px-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          +{hiddenCount} more documents
        </button>
      )}

      {/* CTA */}
      <Link href={`/visa/checklist/${visaType}`}>
        <Button className="w-full bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30">
          View Full Checklist
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}
