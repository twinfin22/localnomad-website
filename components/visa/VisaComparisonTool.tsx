"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Plus,
  X,
  Briefcase,
  GraduationCap,
  Home,
  Laptop,
  Search,
  ArrowRight,
  Plane,
  Building,
  Heart,
  Flag,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";
import { getAllVisas, getVisaInfo } from "@/lib/visa/data";
import { parseLocalePath, buildLocalePath } from "@/lib/i18n/config";
import type { VisaType, VisaInfo } from "@/lib/visa/types";

const categoryIcons: Record<string, typeof Briefcase> = {
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

const categoryColors: Record<string, string> = {
  work: "bg-primary/10 text-primary border-primary/20",
  study: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  residence: "bg-green-500/10 text-green-500 border-green-500/20",
  "digital-nomad": "bg-accent/10 text-accent border-accent/20",
  "job-seeking": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "working-holiday": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  business: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  family: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  "ethnic-korean": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "language-study": "bg-teal-500/10 text-teal-500 border-teal-500/20",
};

interface ComparisonRow {
  label: string;
  key: string;
  render: (visa: VisaInfo) => React.ReactNode;
}

const comparisonRows: ComparisonRow[] = [
  {
    label: "Duration",
    key: "duration",
    render: (visa) => visa.duration.initial,
  },
  {
    label: "Max Duration",
    key: "maxDuration",
    render: (visa) => visa.duration.maxTotal || visa.duration.extension || "—",
  },
  {
    label: "Application Fee",
    key: "fee",
    render: (visa) => visa.fees.application,
  },
  {
    label: "Processing Time",
    key: "processing",
    render: (visa) => visa.processingTime.typical,
  },
  {
    label: "Work Permission",
    key: "work",
    render: (visa) =>
      visa.workPermission.allowed ? (
        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          Allowed
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
          <XCircle className="w-4 h-4" />
          Not Allowed
        </span>
      ),
  },
  {
    label: "Income Requirement",
    key: "income",
    render: (visa) =>
      visa.incomeRequirement
        ? `${visa.incomeRequirement.currency === "USD" ? "$" : "₩"}${visa.incomeRequirement.amount}/${visa.incomeRequirement.period}`
        : "None",
  },
  {
    label: "Target Audience",
    key: "audience",
    render: (visa) => (
      <ul className="text-xs space-y-1">
        {visa.targetAudience.slice(0, 2).map((t, i) => (
          <li key={`audience-${i}`}>• {t}</li>
        ))}
        {visa.targetAudience.length > 2 && (
          <li key="audience-more" className="text-muted-foreground">
            +{visa.targetAudience.length - 2} more
          </li>
        )}
      </ul>
    ),
  },
  {
    label: "Key Requirements",
    key: "requirements",
    render: (visa) => (
      <ul className="text-xs space-y-1">
        {visa.eligibility
          .filter((e) => e.required)
          .slice(0, 3)
          .map((req, i) => (
            <li key={req.id}>• {req.label}</li>
          ))}
      </ul>
    ),
  },
];

export function VisaComparisonTool() {
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const localePath = (path: string) => buildLocalePath(path, locale, country ?? undefined);

  const allVisas = getAllVisas("en");
  const [selectedTypes, setSelectedTypes] = useState<VisaType[]>([
    "d-10",
    "e-7",
  ]);

  const selectedVisas = selectedTypes
    .map((type) => getVisaInfo(type, "en"))
    .filter((v): v is VisaInfo => v !== null);

  const availableVisas = allVisas.filter(
    (v) => !selectedTypes.includes(v.type)
  );

  const addVisa = (type: VisaType) => {
    if (selectedTypes.length < 4) {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const removeVisa = (type: VisaType) => {
    if (selectedTypes.length > 1) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    }
  };

  return (
    <AnimatedSection>
      <div className="space-y-8">
        {/* Visa Selector */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Select Visas to Compare</h2>

          {/* Selected Visas */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedVisas.map((visa) => {
              const Icon = categoryIcons[visa.category] || Briefcase;
              const colorClass =
                categoryColors[visa.category] || categoryColors.work;

              return (
                <div
                  key={visa.type}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 rounded-lg border",
                    colorClass
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{visa.shortName}</span>
                  {selectedTypes.length > 1 && (
                    <button
                      onClick={() => removeVisa(visa.type)}
                      className="ml-1 hover:bg-background/50 rounded p-0.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add More */}
            {selectedTypes.length < 4 && availableVisas.length > 0 && (
              <div className="relative group">
                <button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Visa</span>
                </button>

                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {availableVisas.map((visa) => {
                    const Icon = categoryIcons[visa.category] || Briefcase;
                    return (
                      <button
                        key={visa.type}
                        onClick={() => addVisa(visa.type)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span>{visa.shortName}</span>
                        <span className="text-muted-foreground text-xs ml-auto">
                          {visa.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Select up to 4 visas to compare. Click on a visa chip to remove it.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 bg-muted/50 font-medium text-sm text-muted-foreground w-40 sticky left-0">
                    Attribute
                  </th>
                  {selectedVisas.map((visa) => {
                    const Icon = categoryIcons[visa.category] || Briefcase;
                    const colorClass =
                      categoryColors[visa.category] || categoryColors.work;

                    return (
                      <th
                        key={visa.type}
                        className="p-4 bg-muted/50 text-center min-w-[200px]"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              colorClass.split(" ")[0],
                              colorClass.split(" ")[1]
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{visa.shortName}</p>
                            <p className="text-xs text-muted-foreground font-normal">
                              {visa.name}
                            </p>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.key}
                    className={cn(
                      "border-b border-border last:border-0",
                      index % 2 === 0 ? "bg-background" : "bg-muted/30"
                    )}
                  >
                    <td className="p-4 font-medium text-sm sticky left-0 bg-inherit">
                      {row.label}
                    </td>
                    {selectedVisas.map((visa) => (
                      <td
                        key={visa.type}
                        className="p-4 text-sm text-center align-top"
                      >
                        {row.render(visa)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* View Details Row */}
                <tr className="bg-muted/50">
                  <td className="p-4 font-medium text-sm sticky left-0 bg-inherit">

                  </td>
                  {selectedVisas.map((visa) => (
                    <td key={visa.type} className="p-4 text-center">
                      <Link href={localePath(`/visa/${visa.type}`)}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
          <h3 className="font-semibold mb-2">Not sure which visa is right?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Take our eligibility quiz to find visas with requirements matching
            your situation.
          </p>
          <Link href={localePath("/visa/quiz")}>
            <Button>
              Take the Quiz
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}
