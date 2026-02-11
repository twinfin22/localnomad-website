"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  FileText,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Download,
  Briefcase,
  GraduationCap,
  Home,
  Laptop,
  Search,
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
import type { VisaType, VisaInfo, Document } from "@/lib/visa/types";

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

interface ChecklistState {
  [visaType: string]: {
    [docId: string]: boolean;
  };
}

export function DocumentChecklist() {
  const allVisas = getAllVisas("en");
  const [selectedVisa, setSelectedVisa] = useState<VisaType>("d-10");
  const [checkedItems, setCheckedItems] = useState<ChecklistState>({});
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  const visa = getVisaInfo(selectedVisa, "en");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("visa-checklist");
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("visa-checklist", JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleDoc = (docId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [selectedVisa]: {
        ...prev[selectedVisa],
        [docId]: !prev[selectedVisa]?.[docId],
      },
    }));
  };

  const toggleExpand = (docId: string) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(docId)) {
      newExpanded.delete(docId);
    } else {
      newExpanded.add(docId);
    }
    setExpandedDocs(newExpanded);
  };

  if (!visa) return null;

  const requiredDocs = visa.documents.filter((d) => d.required);
  const optionalDocs = visa.documents.filter((d) => !d.required);

  const completedRequired = requiredDocs.filter(
    (d) => checkedItems[selectedVisa]?.[d.id]
  ).length;
  const completedOptional = optionalDocs.filter(
    (d) => checkedItems[selectedVisa]?.[d.id]
  ).length;
  const totalCompleted = completedRequired + completedOptional;
  const totalDocs = visa.documents.length;
  const progress = (completedRequired / requiredDocs.length) * 100;

  const Icon = categoryIcons[visa.category] || Briefcase;

  return (
    <AnimatedSection>
      <div className="space-y-8">
        {/* Visa Selector */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Select Visa Type</h2>
          <div className="flex flex-wrap gap-2">
            {allVisas.map((v) => {
              const VIcon = categoryIcons[v.category] || Briefcase;
              return (
                <button
                  key={v.type}
                  onClick={() => setSelectedVisa(v.type)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all cursor-pointer",
                    selectedVisa === v.type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <VIcon className="w-4 h-4" />
                  <span className="font-medium text-sm">{v.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{visa.shortName} Documents</h3>
              <p className="text-sm text-muted-foreground">
                {completedRequired} of {requiredDocs.length} required documents
                ready
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Required Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress === 100 ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {progress === 100 && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>All required documents ready!</span>
            </div>
          )}
        </div>

        {/* Required Documents */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Required Documents ({completedRequired}/{requiredDocs.length})
          </h2>

          <div className="space-y-3">
            {requiredDocs.map((doc) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                checked={!!checkedItems[selectedVisa]?.[doc.id]}
                expanded={expandedDocs.has(doc.id)}
                onToggleCheck={() => toggleDoc(doc.id)}
                onToggleExpand={() => toggleExpand(doc.id)}
              />
            ))}
          </div>
        </div>

        {/* Optional Documents */}
        {optionalDocs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Optional Documents ({completedOptional}/{optionalDocs.length})
            </h2>

            <div className="space-y-3">
              {optionalDocs.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  doc={doc}
                  checked={!!checkedItems[selectedVisa]?.[doc.id]}
                  expanded={expandedDocs.has(doc.id)}
                  onToggleCheck={() => toggleDoc(doc.id)}
                  onToggleExpand={() => toggleExpand(doc.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              // Create a simple text version of the checklist
              const lines = [
                `${visa.name} (${visa.shortName}) - Document Checklist`,
                `Generated: ${new Date().toLocaleDateString()}`,
                "",
                "REQUIRED DOCUMENTS:",
                ...requiredDocs.map(
                  (d) =>
                    `[${checkedItems[selectedVisa]?.[d.id] ? "X" : " "}] ${d.name}`
                ),
                "",
                "OPTIONAL DOCUMENTS:",
                ...optionalDocs.map(
                  (d) =>
                    `[${checkedItems[selectedVisa]?.[d.id] ? "X" : " "}] ${d.name}`
                ),
              ];

              const blob = new Blob([lines.join("\n")], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${visa.shortName}-checklist.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Checklist
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}

interface DocumentItemProps {
  doc: Document;
  checked: boolean;
  expanded: boolean;
  onToggleCheck: () => void;
  onToggleExpand: () => void;
}

function DocumentItem({
  doc,
  checked,
  expanded,
  onToggleCheck,
  onToggleExpand,
}: DocumentItemProps) {
  const hasTips = doc.tips && doc.tips.length > 0;
  const hasDetails = hasTips || doc.where_to_get;

  return (
    <div
      className={cn(
        "bg-card border rounded-xl overflow-hidden transition-all",
        checked ? "border-green-500/30 bg-green-500/5" : "border-border"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={onToggleCheck}
          className="mt-0.5 shrink-0 cursor-pointer"
        >
          {checked ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={cn(
                  "font-medium",
                  checked && "line-through text-muted-foreground"
                )}
              >
                {doc.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {doc.description}
              </p>
            </div>

            {hasDetails && (
              <button
                onClick={onToggleExpand}
                className="p-1 hover:bg-muted rounded transition-colors shrink-0 cursor-pointer"
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && hasDetails && (
        <div className="px-4 pb-4 pt-0 ml-8">
          {doc.tips && doc.tips.length > 0 && (
            <div className="bg-accent/5 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-1 text-xs font-medium text-accent mb-1">
                <Lightbulb className="w-3 h-3" />
                Tips
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {doc.tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {doc.where_to_get && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Where to get:</span>{" "}
              {doc.where_to_get}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
