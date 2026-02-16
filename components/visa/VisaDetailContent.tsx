"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/animated-section";
import { parseLocalePath, buildLocalePath } from "@/lib/i18n/config";
import type { VisaInfo } from "@/lib/visa/types";
import { categoryIcons, categoryColors, type TabId } from "./detail/visa-detail-constants";
import { OverviewTab } from "./detail/OverviewTab";
import { DocumentsTab } from "./detail/DocumentsTab";
import { ProcessTab } from "./detail/ProcessTab";
import { FAQTab } from "./detail/FAQTab";

interface VisaDetailContentProps {
  visa: VisaInfo;
}

export function VisaDetailContent({ visa }: VisaDetailContentProps) {
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const localePath = (path: string) => buildLocalePath(path, locale, country ?? undefined);

  const [activeTab, setActiveTab] = useState<TabId>("overview");

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
      {/* Legal Disclaimer Banner */}
      <div className="bg-warning/10 border-b border-warning/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              This information is for general guidance only and does not constitute legal advice.
              Requirements may change. Always verify with the{" "}
              <a href="https://www.immigration.go.kr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Korea Immigration Service
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 sm:px-6 relative overflow-hidden bg-secondary">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <AnimatedSection>
            {/* Breadcrumb */}
            <Link
              href={localePath("/visa")}
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
                  <span className="text-xs uppercase tracking-wide">Duration</span>
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
                  <span className="text-xs uppercase tracking-wide">Processing</span>
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
                      <span className="text-green-600 dark:text-green-400">Allowed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">Not Allowed</span>
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
          {activeTab === "overview" && <OverviewTab visa={visa} />}
          {activeTab === "documents" && <DocumentsTab visa={visa} />}
          {activeTab === "process" && <ProcessTab visa={visa} />}
          {activeTab === "faqs" && <FAQTab visa={visa} />}
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
              {visa.officialLinks.map((link) => (
                <a
                  key={link.url}
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
