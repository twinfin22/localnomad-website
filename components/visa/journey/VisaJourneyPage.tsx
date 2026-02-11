"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Link2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { VisaInfo } from "@/lib/visa/types";
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
}

export function VisaJourneyPage({
  visa,
  backHref,
  dashboardHref,
  checklistHref,
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

  const requiredDocsCount = visa.documents.filter((d) => d.required).length;

  // Generate subtitle for Step 2 (first 3 doc names)
  const docsSubtitle =
    visa.documents
      .slice(0, 3)
      .map((d) => d.name)
      .join(", ") + (visa.documents.length > 3 ? "..." : "");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
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
            title="Check if you qualify"
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
                {visa.faqs.map((faq, i) => (
                  <details key={i} className="group">
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

        {/* Legal disclaimer */}
        <div className="mt-8">
          <LegalDisclaimer variant="inline" />
        </div>
      </div>
    </div>
  );
}
