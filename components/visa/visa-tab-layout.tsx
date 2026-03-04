'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Eye,
  Check,
  FileText,
  ListChecks,
  MessageCircle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { useDocumentProgress } from '@/hooks/use-document-progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MobileTocBar, DesktopTocSidebar } from './sticky-toc';
import type { TocSection } from './sticky-toc';
import { QuickVerdict } from './sections/quick-verdict';
import { RequirementsTab } from './sections/requirements-tab';
import { DocumentsTab } from './sections/documents-tab';
import { ProcessTab } from './sections/process-tab';
import { FaqSection, TipsCommunity, SourcesRelated } from './sections';
import type { Visa } from '@/lib/types/visa';

interface VisaTabLayoutProps {
  visa: Visa;
  country: string;
}

const TAB_IDS = {
  REQUIREMENTS: 'requirements',
  DOCUMENTS: 'documents',
  PROCESS: 'process',
} as const;

const SECTION_IDS = {
  AT_A_GLANCE: 'at-a-glance',
  VISA_TABS: 'visa-tabs',
  FAQ: 'faq',
  TIPS_COMMUNITY: 'tips-community',
  SOURCES_RELATED: 'sources-related',
} as const;

export function VisaTabLayout({ visa, country }: VisaTabLayoutProps) {
  const t = useTranslations('VisaDetail');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>(TAB_IDS.REQUIREMENTS);
  const [hasVisitedDocs, setHasVisitedDocs] = useState(false);
  const { completed: docsCompleted, total: docsTotal } = useDocumentProgress(
    country,
    visa.type,
    visa.documents.length
  );

  // Sync tab from URL hash after hydration (deferred to avoid SSR mismatch)
  useEffect(() => {
    requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1);
      if (
        hash === TAB_IDS.REQUIREMENTS ||
        hash === TAB_IDS.DOCUMENTS ||
        hash === TAB_IDS.PROCESS
      ) {
        setActiveTab(hash);
      }
    });
  }, []);
  const [activeSection, setActiveSection] = useState<string>(
    SECTION_IDS.AT_A_GLANCE
  );
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const hasFaqs = visa.faqs.length > 0;
  const hasTips =
    visa.communityTips !== undefined && visa.communityTips.length > 0;

  // Update URL hash when tab changes
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (value === 'documents') setHasVisitedDocs(true);
    window.history.replaceState(null, '', `#${value}`);
  }, []);

  // TOC sections
  const tocSections: TocSection[] = useMemo(
    () => [
      {
        id: SECTION_IDS.AT_A_GLANCE,
        label: t('atAGlance'),
        icon: <Eye className="h-4 w-4" />,
      },
      {
        id: TAB_IDS.REQUIREMENTS,
        label: t('keyRequirements'),
        icon: <Check className="h-4 w-4" />,
      },
      {
        id: TAB_IDS.DOCUMENTS,
        label: t('documents'),
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: TAB_IDS.PROCESS,
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
      ...(hasTips
        ? [
            {
              id: SECTION_IDS.TIPS_COMMUNITY,
              label: t('communityTips'),
              icon: <Lightbulb className="h-4 w-4" />,
            },
          ]
        : []),
      {
        id: SECTION_IDS.SOURCES_RELATED,
        label: t('sourcesRelated'),
        icon: <ExternalLink className="h-4 w-4" />,
      },
    ],
    [t, hasFaqs, hasTips]
  );

  // Observable section IDs for IntersectionObserver
  const observableIds = useMemo(
    () => [
      SECTION_IDS.AT_A_GLANCE,
      SECTION_IDS.VISA_TABS,
      ...(hasFaqs ? [SECTION_IDS.FAQ] : []),
      ...(hasTips ? [SECTION_IDS.TIPS_COMMUNITY] : []),
      SECTION_IDS.SOURCES_RELATED,
    ],
    [hasFaqs, hasTips]
  );

  // Track which section is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === SECTION_IDS.VISA_TABS) {
              // When tabs section is visible, highlight the active tab in TOC
              setActiveSection(activeTab);
            } else {
              setActiveSection(id);
            }
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    observableIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [observableIds, activeTab]);

  // TOC navigation handler
  const handleNavigate = useCallback(
    (sectionId: string) => {
      // If clicking a tab name, switch tab + scroll to tabs
      if (
        sectionId === TAB_IDS.REQUIREMENTS ||
        sectionId === TAB_IDS.DOCUMENTS ||
        sectionId === TAB_IDS.PROCESS
      ) {
        setActiveTab(sectionId);
        window.history.replaceState(null, '', `#${sectionId}`);
        tabsRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // For accordion sections, open them and scroll
      if (
        sectionId === SECTION_IDS.FAQ ||
        sectionId === SECTION_IDS.TIPS_COMMUNITY ||
        sectionId === SECTION_IDS.SOURCES_RELATED
      ) {
        setOpenAccordions((prev) =>
          prev.includes(sectionId) ? prev : [...prev, sectionId]
        );
      }

      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    []
  );

  return (
    <div className="relative mt-8">
      {/* Mobile/tablet: sticky horizontal pill bar */}
      <MobileTocBar
        sections={tocSections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Layer 1: Quick Verdict */}
      <QuickVerdict visa={visa} />

      {/* Layer 2: Tabs */}
      <div
        id={SECTION_IDS.VISA_TABS}
        ref={tabsRef}
        className="mt-6 scroll-mt-28"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="h-auto w-full overflow-x-auto">
            <TabsTrigger
              value={TAB_IDS.REQUIREMENTS}
              className="flex-1 flex-col gap-0.5 py-2"
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                {t('keyRequirements')}
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {t('tabSubItems', { count: visa.eligibility.length })}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value={TAB_IDS.DOCUMENTS}
              className="relative flex-1 py-2"
            >
              <span className="flex items-center gap-1.5 text-sm">
                <FileText className="h-4 w-4" />
                {t('documents')}
              </span>
              {docsTotal > 0 &&
                (docsCompleted === docsTotal ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold font-mono text-primary">
                    {docsCompleted}/{docsTotal}
                  </span>
                ))}
              {!hasVisitedDocs && (
                <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-primary" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value={TAB_IDS.PROCESS}
              className="flex-1 flex-col gap-0.5 py-2"
            >
              <span className="flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" />
                {t('process')}
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {t('tabSubSteps', { count: visa.applicationSteps.length })}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={TAB_IDS.REQUIREMENTS} className="mt-4">
            <RequirementsTab visa={visa} />
          </TabsContent>
          <TabsContent value={TAB_IDS.DOCUMENTS} className="mt-4">
            <DocumentsTab visa={visa} country={country} />
          </TabsContent>
          <TabsContent value={TAB_IDS.PROCESS} className="mt-4">
            <ProcessTab visa={visa} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Layer 3: Reference (Accordions) */}
      <Accordion
        type="multiple"
        value={openAccordions}
        onValueChange={setOpenAccordions}
        className="mt-6 space-y-3"
      >
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
              <div className="pl-7">
                <FaqSection faqs={visa.faqs} />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {hasTips && (
          <AccordionItem
            value={SECTION_IDS.TIPS_COMMUNITY}
            id={SECTION_IDS.TIPS_COMMUNITY}
            className="scroll-mt-28 rounded-lg border bg-white px-5 last:border-b"
          >
            <AccordionTrigger className="py-5 text-lg font-semibold">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                {t('communityTips')}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <TipsCommunity
                  tips={visa.tips}
                  communityTips={visa.communityTips}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

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
            <div className="pl-7">
              <SourcesRelated
                officialLinks={visa.officialLinks}
                relatedVisas={visa.relatedVisas}
                lastUpdated={visa.lastUpdated}
                country={country}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Desktop: sticky sidebar */}
      <DesktopTocSidebar
        sections={tocSections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
