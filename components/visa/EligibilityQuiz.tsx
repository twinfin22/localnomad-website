"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Home,
  Laptop,
  Search,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";
import { getVisaInfo } from "@/lib/visa/data";
import type { VisaType, VisaInfo } from "@/lib/visa/types";

interface Question {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    visaPoints: Partial<Record<VisaType, number>>;
  }[];
}

const questions: Question[] = [
  {
    id: "purpose",
    question: "What is your primary purpose for coming to Korea?",
    options: [
      {
        value: "remote-work",
        label: "Work remotely for a foreign company",
        visaPoints: { "f-1-d": 3 },
      },
      {
        value: "job-search",
        label: "Find a job in Korea",
        visaPoints: { "d-10": 3, "e-7": 1 },
      },
      {
        value: "employed",
        label: "Already have a job offer in Korea",
        visaPoints: { "e-7": 3 },
      },
      {
        value: "long-term",
        label: "Live in Korea long-term",
        visaPoints: { "f-2": 3, "e-7": 1 },
      },
    ],
  },
  {
    id: "education",
    question: "What is your highest level of education?",
    options: [
      {
        value: "phd",
        label: "PhD or Doctorate",
        visaPoints: { "e-7": 2, "f-2": 2, "d-10": 1 },
      },
      {
        value: "masters",
        label: "Master's Degree",
        visaPoints: { "e-7": 2, "f-2": 2, "d-10": 1 },
      },
      {
        value: "bachelors",
        label: "Bachelor's Degree",
        visaPoints: { "e-7": 1, "d-10": 1, "f-2": 1, "f-1-d": 1 },
      },
      {
        value: "other",
        label: "Other / No degree",
        visaPoints: { "f-1-d": 1 },
      },
    ],
  },
  {
    id: "work-experience",
    question: "How many years of professional work experience do you have?",
    options: [
      {
        value: "10+",
        label: "10+ years",
        visaPoints: { "e-7": 2, "f-2": 2, "f-1-d": 1 },
      },
      {
        value: "5-10",
        label: "5-10 years",
        visaPoints: { "e-7": 2, "f-2": 1, "f-1-d": 1 },
      },
      {
        value: "1-5",
        label: "1-5 years",
        visaPoints: { "e-7": 1, "d-10": 1, "f-1-d": 1 },
      },
      {
        value: "0-1",
        label: "Less than 1 year",
        visaPoints: { "d-10": 1 },
      },
    ],
  },
  {
    id: "income",
    question: "What is your approximate annual income (USD)?",
    options: [
      {
        value: "100k+",
        label: "$100,000+",
        visaPoints: { "f-1-d": 3, "f-2": 2, "e-7": 1 },
      },
      {
        value: "66k-100k",
        label: "$66,000 - $100,000",
        visaPoints: { "f-1-d": 3, "f-2": 1 },
      },
      {
        value: "50k-66k",
        label: "$50,000 - $65,999",
        visaPoints: { "e-7": 1, "f-2": 1 },
      },
      {
        value: "under-50k",
        label: "Under $50,000",
        visaPoints: { "d-10": 1, "e-7": 1 },
      },
    ],
  },
  {
    id: "korean-level",
    question: "What is your Korean language level?",
    options: [
      {
        value: "topik-5-6",
        label: "TOPIK 5-6 (Advanced)",
        visaPoints: { "f-2": 3, "e-7": 2, "d-10": 1 },
      },
      {
        value: "topik-3-4",
        label: "TOPIK 3-4 (Intermediate)",
        visaPoints: { "f-2": 2, "e-7": 1, "d-10": 1 },
      },
      {
        value: "topik-1-2",
        label: "TOPIK 1-2 (Basic)",
        visaPoints: { "f-2": 1, "d-10": 1 },
      },
      {
        value: "none",
        label: "No Korean / Not tested",
        visaPoints: { "f-1-d": 1, "e-7": 0.5 },
      },
    ],
  },
  {
    id: "employer",
    question: "Who would be your employer while in Korea?",
    options: [
      {
        value: "foreign",
        label: "Foreign company (remote work)",
        visaPoints: { "f-1-d": 3 },
      },
      {
        value: "korean",
        label: "Korean company",
        visaPoints: { "e-7": 3, "d-10": 1 },
      },
      {
        value: "self",
        label: "Self-employed / Freelancer",
        visaPoints: { "f-1-d": 2, "f-2": 1 },
      },
      {
        value: "looking",
        label: "Still looking for employment",
        visaPoints: { "d-10": 3 },
      },
    ],
  },
];

const categoryIcons = {
  work: Briefcase,
  study: GraduationCap,
  residence: Home,
  "digital-nomad": Laptop,
  "job-seeking": Search,
};

interface VisaResult {
  type: VisaType;
  visa: VisaInfo;
  score: number;
  maxScore: number;
  percentage: number;
  matchReasons: string[];
}

export function EligibilityQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const goNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const calculateResults = (): VisaResult[] => {
    const visaScores: Record<VisaType, { score: number; reasons: string[] }> = {
      "d-10": { score: 0, reasons: [] },
      "e-7": { score: 0, reasons: [] },
      "f-2": { score: 0, reasons: [] },
      "f-1-d": { score: 0, reasons: [] },
      "d-2": { score: 0, reasons: [] },
      "h-1": { score: 0, reasons: [] },
    };

    // Calculate scores based on answers
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      const option = question.options.find((o) => o.value === answerValue);
      if (!option) return;

      Object.entries(option.visaPoints).forEach(([visaType, points]) => {
        if (points && visaScores[visaType as VisaType]) {
          visaScores[visaType as VisaType].score += points;
          if (points >= 2) {
            visaScores[visaType as VisaType].reasons.push(
              `${question.question.replace("?", "")}: ${option.label}`
            );
          }
        }
      });
    });

    // Calculate max possible score
    const maxScore = questions.length * 3;

    // Convert to results array
    const results: VisaResult[] = (["d-10", "e-7", "f-1-d", "f-2"] as VisaType[])
      .map((type) => {
        const visa = getVisaInfo(type, "en");
        if (!visa) return null;

        const score = visaScores[type].score;
        const percentage = Math.round((score / maxScore) * 100);

        return {
          type,
          visa,
          score,
          maxScore,
          percentage,
          matchReasons: visaScores[type].reasons,
        };
      })
      .filter((r): r is VisaResult => r !== null)
      .sort((a, b) => b.score - a.score);

    return results;
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const hasCurrentAnswer = answers[currentQuestion?.id];

  if (showResults) {
    const results = calculateResults();

    return (
      <AnimatedSection>
        <div className="space-y-6">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">
              Your Results
            </h2>
            <p className="text-muted-foreground">
              Based on your answers, here are your recommended visas
            </p>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map((result, index) => {
              const Icon = categoryIcons[result.visa.category] || Briefcase;
              const isTopMatch = index === 0;

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
                            Best Match
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {result.visa.name}
                      </p>

                      {/* Match Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Match Score
                          </span>
                          <span className="font-semibold">
                            {result.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              result.percentage >= 70
                                ? "bg-green-500"
                                : result.percentage >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            )}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Match Reasons */}
                      {result.matchReasons.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Why this visa:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {result.matchReasons.slice(0, 3).map((reason, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Link href={`/visa/${result.type}`}>
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={restart} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            <Link href="/visa/compare" className="flex-1">
              <Button variant="outline" className="w-full">
                Compare Visas
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection>
      <div className="space-y-8">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                  answers[currentQuestion.id] === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    answers[currentQuestion.id] === option.value
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {answers[currentQuestion.id] === option.value && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button onClick={goNext} disabled={!hasCurrentAnswer}>
            {currentStep === questions.length - 1 ? "See Results" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}
