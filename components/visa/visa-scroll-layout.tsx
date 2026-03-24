'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Eye,
  Check,
  FileText,
  ListChecks,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDocumentProgress } from '@/hooks/use-document-progress';
import { MobileTocBar, DesktopTocSidebar } from './sticky-toc';
import type { TocSection } from './sticky-toc';
import { CollapsibleSection } from './sections/collapsible-section';
import { QuickVerdict } from './sections/quick-verdict';
import type { Visa } from '@/lib/types/visa';

/* Below-fold sections: lazy-loaded to reduce initial JS parse/execute */
const RequirementsTab = dynamic(
  () => import('./sections/requirements-tab').then((m) => ({ default: m.RequirementsTab })),
  { loading: () => <SectionSkeleton rows={4} /> }
);
const DocumentsTab = dynamic(
  () => import('./sections/documents-tab').then((m) => ({ default: m.DocumentsTab })),
  { loading: () => <SectionSkeleton rows={3} /> }
);
const ProcessTab = dynamic(
  () => import('./sections/process-tab').then((m) => ({ default: m.ProcessTab })),
  { loading: () => <SectionSkeleton rows={3} /> }
);
const FaqSection = dynamic(
  () => import('./sections/faq-section').then((m) => ({ default: m.FaqSection })),
  { loading: () => <SectionSkeleton rows={2} /> }
);
const SourcesRelated = dynamic(
  () => import('./sections/sources-related').then((m) => ({ default: m.SourcesRelated })),
  { loading: () => <SectionSkeleton rows={2} /> }
);

/* Skeleton placeholder to preserve layout during lazy load (CLS = 0) */
function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-4 rounded bg-gray-200" style={{ width: `${85 - i * 10}%` }} />
      ))}
    </div>
  );
}

interface VisaScrollLayoutProps {
  visa: Visa;
  country: string;
  relatedVisaSummaries?: { type: string; shortName: string; tagline: string }[];
}

const SECTION_IDS = {
  AT_A_GLANCE: 'at-a-glance',
  REQUIREMENTS: 'requirements',
  DOCUMENTS: 'documents',
  PROCESS: 'process',
  FAQ: 'faq',
  SOURCES: 'sources',
} as const;

export function VisaScrollLayout({
  visa,
  country,
  relatedVisaSummaries,
}: VisaScrollLayoutProps) {
  const t = useTranslations('VisaDetail');
  const [activeSection, setActiveSection] = useState<string>(
    SECTION_IDS.AT_A_GLANCE
  );

  const { completed: docsCompleted, total: docsTotal } = useDocumentProgress(
    country,
    visa.type,
    visa.documents.length
  );

  const requirementsTips = useMemo(
    () => visa.communityTips?.filter((ct) => ct.section === 'requirements') ?? [],
    [visa.communityTips]
  );
  const processTips = useMemo(
    () => visa.communityTips?.filter((ct) => ct.section === 'process') ?? [],
    [visa.communityTips]
  );

  const hasFaqs = visa.faqs.length > 0 || (visa.tips && visa.tips.length > 0);

  // TOC sections
  const tocSections: TocSection[] = useMemo(
    () => [
      {
        id: SECTION_IDS.AT_A_GLANCE,
        label: t('atAGlance'),
        icon: <Eye className="h-4 w-4" />,
      },
      {
        id: SECTION_IDS.REQUIREMENTS,
        label: t('keyRequirements'),
        icon: <Check className="h-4 w-4" />,
      },
      {
        id: SECTION_IDS.DOCUMENTS,
        label: t('documents'),
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: SECTION_IDS.PROCESS,
        label: t('process'),
        icon: <ListChecks className="h-4 w-4" />,
      },
      ...(hasFaqs
        ? [
            {
              id: SECTION_IDS.FAQ,
              label: t('faq'),
              icon: <MessageCircle className="h-4 w-4" />,
            },
          ]
        : []),
      {
        id: SECTION_IDS.SOURCES,
        label: t('sourcesRelated'),
        icon: <ExternalLink className="h-4 w-4" />,
      },
    ],
    [t, hasFaqs]
  );

  // IntersectionObserver for active section tracking
  const sectionIds = useMemo(
    () =>
      Object.values(SECTION_IDS).filter(
        (id) => id !== SECTION_IDS.FAQ || hasFaqs
      ),
    [hasFaqs]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  // TOC navigation — simple scroll to section
  const handleNavigate = useCallback((sectionId: string) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Document progress badge
  const docsBadge =
    docsTotal > 0 ? (
      docsCompleted === docsTotal ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-primary">
          {docsCompleted}/{docsTotal}
        </span>
      )
    ) : null;

  return (
    <div className="relative mt-8" style={{ '--section-gap': '64px' } as React.CSSProperties}>
      {/* Mobile TOC */}
      <MobileTocBar
        sections={tocSections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Sections with visual gaps */}
      <div className="flex flex-col gap-[var(--section-gap)]">
        {/* 1. Quick Verdict */}
        <QuickVerdict visa={visa} />

        {/* 2. Requirements */}
        <CollapsibleSection
          id={SECTION_IDS.REQUIREMENTS}
          icon={<Check className="h-5 w-5 text-primary" />}
          title={t('keyRequirements')}
          summary={visa.keyRequirement}
          defaultOpen
          className="bg-white"
        >
          <RequirementsTab visa={visa} communityTips={requirementsTips} />
        </CollapsibleSection>

        {/* 3. Documents */}
        <CollapsibleSection
          id={SECTION_IDS.DOCUMENTS}
          icon={<FileText className="h-5 w-5 text-primary" />}
          title={t('documents')}
          badge={docsBadge}
          defaultOpen
          className="bg-slate-50"
        >
          <DocumentsTab visa={visa} country={country} />
        </CollapsibleSection>

        {/* 4. Process */}
        <CollapsibleSection
          id={SECTION_IDS.PROCESS}
          icon={<ListChecks className="h-5 w-5 text-primary" />}
          title={t('process')}
          summary={visa.processingTime.totalEndToEnd}
          defaultOpen
          className="bg-white"
        >
          <ProcessTab visa={visa} communityTips={processTips} />
        </CollapsibleSection>

        {/* 5. FAQ + General Tips — collapsed by default */}
        {hasFaqs && (
          <CollapsibleSection
            id={SECTION_IDS.FAQ}
            icon={<MessageCircle className="h-5 w-5 text-primary" />}
            title={t('faq')}
            defaultOpen={false}
            className="bg-primary/[0.02]"
          >
            <FaqSection faqs={visa.faqs} generalTips={visa.tips} />
          </CollapsibleSection>
        )}

        {/* 6. Sources & Related — collapsed by default */}
        <CollapsibleSection
          id={SECTION_IDS.SOURCES}
          icon={<ExternalLink className="h-5 w-5 text-primary" />}
          title={t('sourcesRelated')}
          defaultOpen={false}
          className="bg-slate-50"
        >
          <SourcesRelated
            officialLinks={visa.officialLinks}
            relatedVisas={visa.relatedVisas}
            relatedVisaSummaries={relatedVisaSummaries}
            lastUpdated={visa.lastUpdated}
            country={country}
          />
        </CollapsibleSection>
      </div>

      {/* Desktop TOC sidebar */}
      <DesktopTocSidebar
        sections={tocSections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
