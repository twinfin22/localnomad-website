'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  Clock,
  FileText,
  ListChecks,
  MessageCircle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { DocumentChecklist } from './action-zone';
import { MobileTocBar, DesktopTocSidebar } from './sticky-toc';
import type { TocSection } from './sticky-toc';
import {
  KeyRequirements,
  TimelineFees,
  ApplicationSteps,
  FaqSection,
  TipsCommunity,
  SourcesRelated,
} from './sections';
import type { Visa } from '@/lib/types/visa';
import type { ChecklistItem } from '@/lib/types/dashboard';

interface VisaAccordionLayoutProps {
  visa: Visa;
  country: string;
  isLoggedIn: boolean;
  userVisaId?: string;
  serverChecklist?: ChecklistItem[];
}

const SECTION_IDS = {
  KEY_REQUIREMENTS: 'key-requirements',
  TIMELINE_FEES: 'timeline-fees',
  DOCUMENTS: 'documents',
  APPLICATION_STEPS: 'application-steps',
  FAQ: 'faq',
  TIPS_COMMUNITY: 'tips-community',
  SOURCES_RELATED: 'sources-related',
} as const;

export function VisaAccordionLayout({
  visa,
  country,
  isLoggedIn,
  userVisaId,
  serverChecklist,
}: VisaAccordionLayoutProps) {
  const t = useTranslations('VisaDetail');
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<string>(
    SECTION_IDS.KEY_REQUIREMENTS
  );

  const hasFaqs = visa.faqs.length > 0;
  const hasTips =
    visa.tips.length > 0 ||
    (visa.communityTips !== undefined && visa.communityTips.length > 0);

  // All visible section IDs (for IntersectionObserver)
  const visibleSectionIds = [
    SECTION_IDS.KEY_REQUIREMENTS,
    SECTION_IDS.TIMELINE_FEES,
    SECTION_IDS.DOCUMENTS,
    SECTION_IDS.APPLICATION_STEPS,
    ...(hasFaqs ? [SECTION_IDS.FAQ] : []),
    ...(hasTips ? [SECTION_IDS.TIPS_COMMUNITY] : []),
    SECTION_IDS.SOURCES_RELATED,
  ];

  const tocSections: TocSection[] = [
    {
      id: SECTION_IDS.KEY_REQUIREMENTS,
      label: t('keyRequirements'),
      icon: <Check className="h-4 w-4" />,
    },
    {
      id: SECTION_IDS.TIMELINE_FEES,
      label: t('timelineFees'),
      icon: <Clock className="h-4 w-4" />,
    },
    {
      id: SECTION_IDS.DOCUMENTS,
      label: t('documents'),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: SECTION_IDS.APPLICATION_STEPS,
      label: t('applicationSteps'),
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
    ...(hasTips
      ? [
          {
            id: SECTION_IDS.TIPS_COMMUNITY,
            label: t('tipsCommunity'),
            icon: <Lightbulb className="h-4 w-4" />,
          },
        ]
      : []),
    {
      id: SECTION_IDS.SOURCES_RELATED,
      label: t('sourcesRelated'),
      icon: <ExternalLink className="h-4 w-4" />,
    },
  ];

  // Track which section is currently in view
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

    visibleSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev : [...prev, sectionId]
    );
    setTimeout(() => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <div className="relative mt-8">
      {/* Mobile/tablet: sticky horizontal pill bar */}
      <MobileTocBar
        sections={tocSections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
        className="mt-4 space-y-3"
      >
        {/* Key Requirements */}
        <AccordionItem
          value={SECTION_IDS.KEY_REQUIREMENTS}
          id={SECTION_IDS.KEY_REQUIREMENTS}
          className="scroll-mt-28 rounded-lg border bg-white px-5 last:border-b"
        >
          <AccordionTrigger className="py-5 text-lg font-semibold">
            <span className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              {t('keyRequirements')}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <KeyRequirements visa={visa} />
          </AccordionContent>
        </AccordionItem>

        {/* Timeline & Fees */}
        <AccordionItem
          value={SECTION_IDS.TIMELINE_FEES}
          id={SECTION_IDS.TIMELINE_FEES}
          className="scroll-mt-28 rounded-lg border bg-white px-5 last:border-b"
        >
          <AccordionTrigger className="py-5 text-lg font-semibold">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t('timelineFees')}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <TimelineFees visa={visa} />
          </AccordionContent>
        </AccordionItem>

        {/* Documents */}
        <AccordionItem
          value={SECTION_IDS.DOCUMENTS}
          id={SECTION_IDS.DOCUMENTS}
          className="scroll-mt-28 rounded-lg border bg-white px-5 last:border-b"
        >
          <AccordionTrigger className="py-5 text-lg font-semibold">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('documents')}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <DocumentChecklist
              documents={visa.documents}
              visaType={visa.type}
              country={country}
              isLoggedIn={isLoggedIn}
              userVisaId={userVisaId}
              serverChecklist={serverChecklist}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Application Steps */}
        <AccordionItem
          value={SECTION_IDS.APPLICATION_STEPS}
          id={SECTION_IDS.APPLICATION_STEPS}
          className="scroll-mt-28 rounded-lg border bg-white px-5 last:border-b"
        >
          <AccordionTrigger className="py-5 text-lg font-semibold">
            <span className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              {t('applicationSteps')}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ApplicationSteps steps={visa.applicationSteps} />
          </AccordionContent>
        </AccordionItem>

        {/* FAQ */}
        {hasFaqs && (
          <AccordionItem
            value={SECTION_IDS.FAQ}
            id={SECTION_IDS.FAQ}
            className="scroll-mt-28 rounded-lg border bg-white px-5 last:border-b"
          >
            <AccordionTrigger className="py-5 text-lg font-semibold">
              <span className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {t('faq')}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <FaqSection faqs={visa.faqs} />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Tips & Community */}
        {hasTips && (
          <AccordionItem
            value={SECTION_IDS.TIPS_COMMUNITY}
            id={SECTION_IDS.TIPS_COMMUNITY}
            className="scroll-mt-28 rounded-lg border bg-white px-5 last:border-b"
          >
            <AccordionTrigger className="py-5 text-lg font-semibold">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                {t('tipsCommunity')}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <TipsCommunity
                tips={visa.tips}
                communityTips={visa.communityTips}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Sources & Related */}
        <AccordionItem
          value={SECTION_IDS.SOURCES_RELATED}
          id={SECTION_IDS.SOURCES_RELATED}
          className="scroll-mt-28 rounded-lg border bg-white px-5 last:border-b"
        >
          <AccordionTrigger className="py-5 text-lg font-semibold">
            <span className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              {t('sourcesRelated')}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <SourcesRelated
              officialLinks={visa.officialLinks}
              relatedVisas={visa.relatedVisas}
              lastUpdated={visa.lastUpdated}
              country={country}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Desktop: sticky sidebar positioned right of content */}
      <DesktopTocSidebar
        sections={tocSections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
