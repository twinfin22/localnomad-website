'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/animated-section';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Briefcase,
  GraduationCap,
  Home,
  Laptop,
  Search,
  Calendar,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import type { VisaInfo } from '@/lib/visa/types';
import { ModeToggle, type DetailMode } from './ModeToggle';
import { SectionNav } from './SectionNav';
import { VisaSnapshot } from './VisaSnapshot';
import { EligibilitySection } from './EligibilitySection';
import { DocumentPreview } from './DocumentPreview';
import { ApplicationProcess } from './ApplicationProcess';
import { ThingsToKnow } from './ThingsToKnow';
import { QuizDisclaimer } from '@/components/visa/LegalDisclaimer';

interface VisaDetailPageProps {
  visa: VisaInfo;
}

const categoryIcons = {
  work: Briefcase,
  study: GraduationCap,
  residence: Home,
  'digital-nomad': Laptop,
  'job-seeking': Search,
  'working-holiday': Compass,
};

// Format date to human-friendly format (e.g., "Feb 2026")
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const categoryColors = {
  work: 'bg-cyan-500/10 text-cyan-400',
  study: 'bg-blue-500/10 text-blue-400',
  residence: 'bg-emerald-500/10 text-emerald-400',
  'digital-nomad': 'bg-purple-500/10 text-purple-400',
  'job-seeking': 'bg-amber-500/10 text-amber-400',
  'working-holiday': 'bg-orange-500/10 text-orange-400',
};

const categoryLabels: Record<string, string> = {
  work: 'work',
  study: 'study',
  residence: 'residence',
  'digital-nomad': 'digital nomad',
  'job-seeking': 'job seeking',
  'working-holiday': 'travel & work',
};

export function VisaDetailPage({ visa }: VisaDetailPageProps) {
  const [mode, setMode] = useState<DetailMode>('exploring');

  const Icon = categoryIcons[visa.category] || Briefcase;
  const colorClass = categoryColors[visa.category] || categoryColors.work;

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Hero Section */}
      <section className="pt-28 pb-6 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <AnimatedSection>
            {/* Breadcrumb */}
            <Link
              href="/visa"
              className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Visa Guide
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Icon and basic info */}
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0',
                    colorClass
                  )}
                >
                  <Icon className="w-8 h-8" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {categoryLabels[visa.category] || visa.category.replace('-', ' ')}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {visa.name}
                  </h1>
                  <p className="text-slate-400">{visa.tagline}</p>
                </div>
              </div>

              {/* Quick stats (minimal) */}
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Updated {formatDate(visa.lastUpdated)}</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mode Toggle */}
      <section className="px-4 sm:px-6 py-3 border-y border-slate-800 bg-[#0F172A] sticky top-16 z-20">
        <div className="container mx-auto max-w-5xl">
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>
      </section>

      {/* Section Nav (only in exploring mode) */}
      {mode === 'exploring' && <SectionNav />}

      {/* Main Content */}
      <section className="py-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          {mode === 'exploring' ? (
            <ExploringContent visa={visa} />
          ) : (
            <HolderContent visa={visa} />
          )}
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// Exploring Mode Content (Restructured)
// =============================================================================

interface ExploringContentProps {
  visa: VisaInfo;
}

function ExploringContent({ visa }: ExploringContentProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  const MAX_INITIAL_FAQS = 3;
  const displayedFaqs = showAllFaqs
    ? visa.faqs
    : visa.faqs?.slice(0, MAX_INITIAL_FAQS);
  const hiddenFaqCount = (visa.faqs?.length || 0) - MAX_INITIAL_FAQS;

  return (
    <div className="space-y-10">
      {/* Section 1: Visa Snapshot (At a Glance) */}
      <AnimatedSection>
        <VisaSnapshot visa={visa} />
      </AnimatedSection>

      {/* Section 2: Eligibility & Requirements (Merged) */}
      <AnimatedSection>
        <EligibilitySection visa={visa} />
      </AnimatedSection>

      {/* Section 3: Documents (Collapsed list) */}
      <AnimatedSection>
        <DocumentPreview documents={visa.documents} visaType={visa.type} />
      </AnimatedSection>

      {/* Section 4: Application Process (Accordion) */}
      <AnimatedSection>
        <ApplicationProcess
          steps={visa.applicationSteps}
          processingTime={visa.processingTime}
        />
      </AnimatedSection>

      {/* Section 5: Things to Know (Merged Tips + Warnings) */}
      <AnimatedSection>
        <ThingsToKnow warnings={visa.warnings} tips={visa.tips} />
      </AnimatedSection>

      {/* Section 6: FAQs (Limited, with expand) */}
      {visa.faqs && visa.faqs.length > 0 && (
        <AnimatedSection>
          <div id="faqs" className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {displayedFaqs?.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-white text-sm">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2',
                        expandedFaq === index && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4 border-t border-slate-700/50">
                      <p className="text-sm text-slate-400 pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Show all button */}
            {hiddenFaqCount > 0 && !showAllFaqs && (
              <button
                onClick={() => setShowAllFaqs(true)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Show all {visa.faqs?.length} questions
              </button>
            )}
          </div>
        </AnimatedSection>
      )}

      {/* Section 7: Official Links */}
      {visa.officialLinks && visa.officialLinks.length > 0 && (
        <AnimatedSection>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Official Resources</h2>
            <div className="flex flex-wrap gap-2">
              {visa.officialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Disclaimer */}
      <AnimatedSection>
        <QuizDisclaimer className="mt-4" />
      </AnimatedSection>
    </div>
  );
}

// =============================================================================
// Holder Mode Content
// =============================================================================

interface HolderContentProps {
  visa: VisaInfo;
}

function HolderContent({ visa }: HolderContentProps) {
  return (
    <div className="space-y-8">
      {/* Dashboard Preview Cards */}
      <AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Track Expiry</h3>
                <p className="text-xs text-slate-500">Never miss a deadline</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Set your visa expiry date and get reminders 90, 60, and 30 days before renewal is needed.
            </p>
            <Link href="/visa/dashboard">
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Checklist Card */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Document Checklist</h3>
                <p className="text-xs text-slate-500">Track your documents</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Keep track of which documents you have and which you still need for your next extension.
            </p>
            <Link href={`/visa/checklist/${visa.type}`}>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full">
                View Checklist
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Important Reminders */}
      <AnimatedSection>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Important Reminders
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Start extension process early</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Begin gathering documents and book your immigration appointment at least 2 months before expiry.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Report address changes</p>
                  <p className="text-xs text-slate-400 mt-1">
                    You must report any change of address to immigration within 14 days via HiKorea or in person.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Keep financial records</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tax payment certificates and income proof are often required for extensions. File taxes on time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Practical Resources */}
      <AnimatedSection>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Practical Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://www.hikorea.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">HiKorea Portal</p>
                  <p className="text-xs text-slate-500">Book appointments, report address</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </a>
            <a
              href="https://www.immigration.go.kr/immigration_eng/index.do"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Immigration Service</p>
                  <p className="text-xs text-slate-500">Official visa information</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </a>
            <a
              href="https://www.nts.go.kr/english/main.do"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">National Tax Service</p>
                  <p className="text-xs text-slate-500">Tax filing, payment certificates</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </a>
            <a
              href="https://www.nhis.or.kr/english/wbheaa01000m01.do"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Health Insurance (NHIS)</p>
                  <p className="text-xs text-slate-500">Enrollment, payments, claims</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* Renewal Info */}
      {visa.duration.extension && (
        <AnimatedSection>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Extension & Renewal</h2>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-500">Extension Period</span>
                  <p className="text-slate-300">{visa.duration.extension}</p>
                </div>
                {visa.duration.maxTotal && (
                  <div>
                    <span className="text-sm text-slate-500">Maximum Total Stay</span>
                    <p className="text-slate-300">{visa.duration.maxTotal}</p>
                  </div>
                )}
              </div>
              {visa.fees.extension && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <span className="text-sm text-slate-500">Extension Fee</span>
                  <p className="text-slate-300">{visa.fees.extension}</p>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Related visas for path planning */}
      {visa.relatedVisas && visa.relatedVisas.length > 0 && (
        <AnimatedSection>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">What&apos;s Next?</h2>
            <p className="text-slate-400">
              Consider these visa options for your next step:
            </p>
            <div className="flex flex-wrap gap-3">
              {visa.relatedVisas.map((relatedVisa) => (
                <Link
                  key={relatedVisa}
                  href={`/visa/${relatedVisa}`}
                  className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                >
                  {relatedVisa.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
