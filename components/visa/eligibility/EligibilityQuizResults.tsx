import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";
import { QuizDisclaimer } from "@/components/visa/LegalDisclaimer";
import { categoryIcons, type VisaResult } from "./eligibility-quiz-data";

interface ConsentGateProps {
  consentGiven: boolean;
  onConsentChange: (checked: boolean) => void;
  onBack: () => void;
  onViewResults: () => void;
}

export function ConsentGate({ consentGiven, onConsentChange, onBack, onViewResults }: ConsentGateProps) {
  return (
    <AnimatedSection>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Before viewing results</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Please acknowledge the following before we show your results.
          </p>

          <label className="flex items-start gap-3 text-left p-4 rounded-xl border border-border bg-muted/30 cursor-pointer mb-6 max-w-lg mx-auto">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => onConsentChange(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-primary"
            />
            <span className="text-sm text-muted-foreground">
              I understand this tool matches my answers against published
              requirements and does not determine my eligibility. Final
              decisions are made by the relevant immigration authorities.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questions
            </Button>
            <Button onClick={onViewResults} disabled={!consentGiven}>
              View Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

interface EligibilityQuizResultsProps {
  results: VisaResult[];
  localePath: (path: string) => string;
  onRestart: () => void;
}

export function EligibilityQuizResults({ results, localePath, onRestart }: EligibilityQuizResultsProps) {
  return (
    <AnimatedSection>
      <div className="space-y-6">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold  mb-2">
            Your Results
          </h2>
          <p className="text-muted-foreground">
            Visas with matching requirements include...
          </p>
        </div>

        <QuizDisclaimer className="mb-4" />

        {/* Results List */}
        <div className="space-y-4">
          {results.map((result, index) => {
            const Icon = categoryIcons[result.visa.category] || Briefcase;
            const isTopMatch = false;

            return (
              <div
                key={result.type}
                className={cn(
                  "bg-card border rounded-2xl p-6 transition-all",
                  isTopMatch
                    ? "border-primary shadow-lg"
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                      isTopMatch
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">
                        {result.visa.shortName}
                      </h3>
                      {isTopMatch && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                          Most requirements listed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {result.visa.name}
                    </p>

                    {/* Match Reasons */}
                    {result.matchReasons.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Why this visa:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {result.matchReasons.slice(0, 3).map((reason, i) => (
                            <li key={`reason-${i}`} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link href={localePath(`/visa/${result.type}`)}>
                      <Button
                        variant={isTopMatch ? "default" : "outline"}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <QuizDisclaimer className="mt-4" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button variant="outline" onClick={onRestart} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          <Link href={localePath("/visa/compare")} className="flex-1">
            <Button variant="outline" className="w-full">
              Compare Visas
            </Button>
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}
