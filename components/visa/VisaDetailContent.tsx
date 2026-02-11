"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Home,
  Laptop,
  Search,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Users,
  Plane,
  Building,
  Heart,
  Flag,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";
import type { VisaInfo } from "@/lib/visa/types";

interface VisaDetailContentProps {
  visa: VisaInfo;
}

const categoryIcons = {
  work: Briefcase,
  study: GraduationCap,
  residence: Home,
  "digital-nomad": Laptop,
  "job-seeking": Search,
  "working-holiday": Plane,
  business: Building,
  family: Heart,
  "ethnic-korean": Flag,
  "language-study": BookOpen,
};

const categoryColors = {
  work: "bg-primary/10 text-primary",
  study: "bg-blue-500/10 text-blue-500",
  residence: "bg-green-500/10 text-green-500",
  "digital-nomad": "bg-accent/10 text-accent",
  "job-seeking": "bg-orange-500/10 text-orange-500",
  "working-holiday": "bg-yellow-500/10 text-yellow-500",
  business: "bg-purple-500/10 text-purple-500",
  family: "bg-pink-500/10 text-pink-500",
  "ethnic-korean": "bg-indigo-500/10 text-indigo-500",
  "language-study": "bg-teal-500/10 text-teal-500",
};

type TabId = "overview" | "documents" | "process" | "faqs";

export function VisaDetailContent({ visa }: VisaDetailContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const Icon = categoryIcons[visa.category] || Briefcase;
  const colorClass = categoryColors[visa.category] || categoryColors.work;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "documents", label: "Documents" },
    { id: "process", label: "Process" },
    { id: "faqs", label: "FAQs" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 sm:px-6 relative overflow-hidden bg-secondary">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <AnimatedSection>
            {/* Breadcrumb */}
            <Link
              href="/visa"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Visa Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center shrink-0",
                  colorClass
                )}
              >
                <Icon className="w-10 h-10" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {visa.category.replace("-", " ")}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold  mb-2">
                  {visa.name}
                </h1>
                <p className="text-xl text-primary font-semibold mb-4">
                  {visa.shortName}
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {visa.description}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">
                    Duration
                  </span>
                </div>
                <p className="font-semibold">{visa.duration.initial}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Fee</span>
                </div>
                <p className="font-semibold">{visa.fees.application}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">
                    Processing
                  </span>
                </div>
                <p className="font-semibold">{visa.processingTime.typical}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Work</span>
                </div>
                <p className="font-semibold flex items-center gap-1">
                  {visa.workPermission.allowed ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        Allowed
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">
                        Not Allowed
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="sticky top-16 z-20 bg-background border-b border-border">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <AnimatedSection>
              <div className="space-y-12">
                {/* Target Audience */}
                <div>
                  <h2 className="text-2xl font-bold  mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Who Is This Visa For?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visa.targetAudience.map((target, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span>{target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <h2 className="text-2xl font-bold  mb-4">
                    Eligibility Requirements
                  </h2>
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <ul className="space-y-4">
                      {visa.eligibility.map((req) => (
                        <li key={req.id} className="flex items-start gap-3">
                          {req.required ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <span
                              className={cn(
                                "font-medium",
                                !req.required && "text-muted-foreground"
                              )}
                            >
                              {req.label}
                            </span>
                            {req.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {req.description}
                              </p>
                            )}
                            {!req.required && (
                              <span className="text-xs text-muted-foreground">
                                (Optional)
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Income Requirement */}
                {visa.incomeRequirement && (
                  <div>
                    <h2 className="text-2xl font-bold  mb-4">
                      Income Requirement
                    </h2>
                    <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-accent">
                          {visa.incomeRequirement.currency === "USD"
                            ? "$"
                            : "₩"}
                          {visa.incomeRequirement.amount}
                        </span>
                        <span className="text-muted-foreground">
                          / {visa.incomeRequirement.period}
                        </span>
                      </div>
                      {visa.incomeRequirement.notes && (
                        <p className="text-sm text-muted-foreground">
                          {visa.incomeRequirement.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Work Permission Details */}
                {visa.workPermission.restrictions &&
                  visa.workPermission.restrictions.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold  mb-4">
                        Work Permission Details
                      </h2>
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          {visa.workPermission.allowed ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                Work is allowed with restrictions
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-500" />
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                Work is not allowed
                              </span>
                            </>
                          )}
                        </div>
                        <ul className="space-y-2">
                          {visa.workPermission.restrictions.map(
                            (restriction, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                {restriction}
                              </li>
                            )
                          )}
                        </ul>
                        {visa.workPermission.notes && (
                          <p className="mt-4 text-sm text-muted-foreground italic">
                            {visa.workPermission.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Tips & Warnings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tips */}
                  <div>
                    <h2 className="text-xl font-bold  mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      Tips
                    </h2>
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <ul className="space-y-3">
                        {visa.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Warnings */}
                  {visa.warnings && visa.warnings.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold  mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Warnings
                      </h2>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                        <ul className="space-y-3">
                          {visa.warnings.map((warning, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">
                                {warning}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <AnimatedSection>
              <div>
                <h2 className="text-2xl font-bold  mb-6">
                  Required Documents
                </h2>
                <div className="space-y-4">
                  {visa.documents.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            doc.required
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{doc.name}</h3>
                            {doc.required ? (
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                Required
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {doc.description}
                          </p>
                          {doc.tips && doc.tips.length > 0 && (
                            <div className="bg-accent/5 rounded-lg p-3">
                              <p className="text-xs font-medium text-accent mb-1">
                                Tips:
                              </p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {doc.tips.map((tip, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="text-accent">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {doc.where_to_get && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">Where to get:</span>{" "}
                              {doc.where_to_get}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Process Tab */}
          {activeTab === "process" && (
            <AnimatedSection>
              <div>
                <h2 className="text-2xl font-bold  mb-6">
                  Application Process
                </h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-6">
                    {visa.applicationSteps.map((step, index) => (
                      <div key={step.id} className="relative flex gap-6">
                        {/* Step number */}
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0 z-10">
                          {step.step}
                        </div>

                        {/* Step content */}
                        <div className="flex-1 bg-card border border-border rounded-xl p-6 pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold">
                              {step.title}
                            </h3>
                            {step.duration && (
                              <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {step.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {step.description}
                          </p>
                          {step.tips && step.tips.length > 0 && (
                            <div className="bg-accent/5 rounded-lg p-3 mb-3">
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {step.tips.map((tip, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <Lightbulb className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.links && step.links.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {step.links.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <AnimatedSection>
              <div>
                <h2 className="text-2xl font-bold  mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {visa.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedFaq(expandedFaq === index ? null : index)
                        }
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <span className="font-medium pr-4">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-5 pb-5 pt-0">
                          <p className="text-sm text-muted-foreground">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Official Links */}
      <section className="py-12 px-4 sm:px-6 bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <AnimatedSection>
            <h2 className="text-xl font-bold  mb-4">
              Official Resources
            </h2>
            <div className="flex flex-wrap gap-3">
              {visa.officialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Last updated: {visa.lastUpdated}
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
