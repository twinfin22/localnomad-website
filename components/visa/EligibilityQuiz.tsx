"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";
import { getVisaInfo } from "@/lib/visa/data";
import { parseLocalePath, buildLocalePath } from "@/lib/i18n/config";
import type { VisaType } from "@/lib/visa/types";
import { questions, type VisaResult } from "./eligibility/eligibility-quiz-data";
import { ConsentGate, EligibilityQuizResults } from "./eligibility/EligibilityQuizResults";

export function EligibilityQuiz() {
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const localePath = (path: string) =>
    buildLocalePath(path, locale, country ?? undefined);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentGate, setShowConsentGate] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const goNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConsentGate(true);
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
    setConsentGiven(false);
    setShowConsentGate(false);
  };

  const calculateResults = (): VisaResult[] => {
    const visaScores: Record<string, { score: number; reasons: string[] }> = {
      "d-10": { score: 0, reasons: [] },
      "e-7": { score: 0, reasons: [] },
      "f-2": { score: 0, reasons: [] },
      "f-1-d": { score: 0, reasons: [] },
      "d-2": { score: 0, reasons: [] },
      "h-1": { score: 0, reasons: [] },
      "e-2": { score: 0, reasons: [] },
      "d-7": { score: 0, reasons: [] },
      "d-8": { score: 0, reasons: [] },
      "f-6": { score: 0, reasons: [] },
      "f-4": { score: 0, reasons: [] },
      "d-4": { score: 0, reasons: [] },
    };

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

    const maxScore = questions.length * 3;

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

  // Consent gate
  if (showConsentGate && !showResults) {
    return (
      <ConsentGate
        consentGiven={consentGiven}
        onConsentChange={setConsentGiven}
        onBack={() => {
          setShowConsentGate(false);
          setCurrentStep(questions.length - 1);
        }}
        onViewResults={() => setShowResults(true)}
      />
    );
  }

  // Results
  if (showResults) {
    return (
      <EligibilityQuizResults
        results={calculateResults()}
        localePath={localePath}
        onRestart={restart}
      />
    );
  }

  // Quiz step UI
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
