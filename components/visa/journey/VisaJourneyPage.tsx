"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Link2,
  ChevronRight,
  ChevronDown,
  Info,
  Route,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisaInfo } from "@/lib/visa/types";
import { VISA_DISPLAY_INFO } from "@/lib/visa/path-data";
import { ChecklistStep } from "./ChecklistStep";
import {
  StepQualify,
  StepDocuments,
  StepApply,
  StepAfterApproval,
} from "./steps";
import { LegalDisclaimer } from "@/components/visa/LegalDisclaimer";

interface VisaJourneyPageProps {
  visa: VisaInfo;
  backHref: string;
  dashboardHref: string;
  checklistHref: string;
  pathSimulatorHref?: string;
}

export function VisaJourneyPage({
  visa,
  backHref,
  dashboardHref,
  checklistHref,
  pathSimulatorHref,
}: VisaJourneyPageProps) {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  // Handle deep-link for holder mode (#after-approval or ?mode=holder)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      if (hash === "#after-approval" || params.get("mode") === "holder") {
        setOpenStep(4);
        // Scroll to step 4 after a brief delay
        setTimeout(() => {
          document
            .getElementById("after-approval")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  const handleStepToggle = (stepNumber: number) => (isOpen: boolean) => {
    // Accordion behavior: only one step open at a time
    setOpenStep(isOpen ? stepNumber : null);
  };

  const [bannerDismissed, setBannerDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("visa-info-banner-dismissed");
    if (!dismissed) {
      setBannerDismissed(false);
    }
  }, []);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("visa-info-banner-dismissed", "true");
  };

  const requiredDocsCount = visa.documents.filter((d) => d.required).length;

  // Generate subtitle for Step 2 (first 3 doc names)
  const docsSubtitle =
    visa.documents
      .slice(0, 3)
      .map((d) => d.name)
      .join(", ") + (visa.documents.length > 3 ? "..." : "");

  return (
    <div className="min-h-screen bg-background">
      {/* Dismissible info banner */}
      {!bannerDismissed && (
        <div className="bg-blue-500/10 border-b border-blue-500/20">
          <div className="container mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-300 flex-1">
                Information shown is based on publicly available requirements
                and may not reflect recent policy changes. Verify with official
                sources before making decisions.
              </p>
              <button
                onClick={handleDismissBanner}
                className="text-blue-300/60 hover:text-blue-300 transition-colors shrink-0"
                aria-label="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-3xl px-4 pt-24 pb-8">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Visa Guide
        </Link>

        {/* Compact header */}
        <header className="mb-8">
          <div className="text-3xl font-bold text-foreground mb-1">
            {visa.shortName}
          </div>
          <h1 className="text-xl text-muted-foreground mb-2">{visa.name}</h1>
          <p className="text-muted-foreground mb-4">{visa.tagline}</p>

          {/* Stats line */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Duration: {visa.duration.initial}</span>
            <span className="text-muted-foreground">·</span>
            <span>Cost: {visa.fees.application}</span>
            <span className="text-muted-foreground">·</span>
            <span>Processing: {visa.processingTime.typical}</span>
          </div>
        </header>

        {/* Divider */}
        <hr className="border-border mb-8" />

        {/* Journey heading */}
        <h2 className="text-lg font-medium text-foreground mb-6">
          Your path to a {visa.shortName} visa:
        </h2>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <ChecklistStep
            number={1}
            title="Review requirements"
            subtitle={
              visa.keyRequirement ||
              visa.eligibility[0]?.label ||
              "Review requirements"
            }
            id="qualify"
            defaultOpen={openStep === 1}
            onToggle={handleStepToggle(1)}
          >
            <StepQualify visa={visa} />
          </ChecklistStep>

          <ChecklistStep
            number={2}
            title="Gather your documents"
            subtitle={docsSubtitle}
            badge={`${requiredDocsCount} items`}
            id="documents"
            defaultOpen={openStep === 2}
            onToggle={handleStepToggle(2)}
          >
            <StepDocuments visa={visa} checklistHref={checklistHref} />
          </ChecklistStep>

          <ChecklistStep
            number={3}
            title="Submit your application"
            subtitle={
              visa.applicationSteps[0]?.title || "Follow the application process"
            }
            id="apply"
            defaultOpen={openStep === 3}
            onToggle={handleStepToggle(3)}
          >
            <StepApply visa={visa} />
          </ChecklistStep>

          <ChecklistStep
            number={4}
            title="After approval"
            subtitle="Renewal, address reporting, key deadlines"
            id="after-approval"
            defaultOpen={openStep === 4}
            onToggle={handleStepToggle(4)}
          >
            <StepAfterApproval
              visa={visa}
              dashboardHref={dashboardHref}
              checklistHref={checklistHref}
            />
          </ChecklistStep>
        </div>

        {/* Divider */}
        <hr className="border-border mb-4" />

        {/* FAQs row */}
        {visa.faqs && visa.faqs.length > 0 && (
          <>
            <button
              onClick={() => setFaqsOpen(!faqsOpen)}
              className="w-full flex items-center justify-between py-3 text-left"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                <span>Common questions</span>
              </div>
              {faqsOpen ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {faqsOpen && (
              <div className="pb-4 space-y-1">
                {visa.faqs.map((faq) => (
                  <details key={faq.question} className="group">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground py-2 list-none flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                      {faq.question}
                    </summary>
                    <p className="text-sm text-muted-foreground pl-6 pb-2">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            )}
          </>
        )}

        {/* Resources row */}
        {visa.officialLinks && visa.officialLinks.length > 0 && (
          <>
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="w-full flex items-center justify-between py-3 text-left"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link2 className="w-5 h-5" />
                <span>Official resources</span>
              </div>
              {resourcesOpen ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {resourcesOpen && (
              <div className="pb-4 space-y-2 pl-7">
                {visa.officialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:text-accent-hover py-1"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {/* Related Visas */}
        {visa.relatedVisas && visa.relatedVisas.length > 0 && (
          <>
            <hr className="border-border my-4" />
            <div className="py-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Related visas
              </h3>
              <div className="grid gap-2">
                {visa.relatedVisas.map((relatedType) => {
                  const info = VISA_DISPLAY_INFO[relatedType];
                  if (!info) return null;

                  // Derive href from backHref (which is /[lang]/[country]/visa)
                  const relatedHref = `${backHref.replace(/\/$/, "")}/${relatedType}`;

                  return (
                    <Link
                      key={relatedType}
                      href={relatedHref}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 bg-surface hover:bg-elevated transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-sm font-bold text-primary uppercase">
                          {relatedType}
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm text-foreground font-medium">
                            {info.name}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {info.shortDescription}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>

              {/* Path simulator link */}
              {pathSimulatorHref && (
                <Link
                  href={`${pathSimulatorHref}?from=${visa.type}`}
                  className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-accent-hover transition-colors"
                >
                  <Route className="w-4 h-4" />
                  <span>Explore transition paths from {visa.shortName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </>
        )}

        {/* Legal disclaimer */}
        <div className="mt-8">
          <LegalDisclaimer variant="inline" />
        </div>
      </div>
    </div>
  );
}
