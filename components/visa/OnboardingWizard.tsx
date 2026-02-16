"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createProgress, saveProgress } from "@/lib/visa/stateMachine";
import { parseLocalePath, buildLocalePath } from "@/lib/i18n/config";
import type { VisaType } from "@/lib/visa/types";
import { steps } from "./onboarding/onboarding-data";
import type { GoalOption, SituationOption, VisaMatch } from "./onboarding/onboarding-types";
import { GoalStep, SituationStep } from "./onboarding/OnboardingSteps";
import { ResultsStep, SetupStep } from "./onboarding/OnboardingResults";
import { visaInfo } from "./onboarding/onboarding-data";

export function OnboardingWizard() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { locale, country } = parseLocalePath(pathname);
  const localePath = (path: string) => buildLocalePath(path, locale, country ?? undefined);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [situationStep, setSituationStep] = useState<string | null>(null);
  const [matches, setMatches] = useState<VisaMatch[]>([]);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [targetDate, setTargetDate] = useState<string>("");

  // Calculate visa matches
  const calculateMatches = (situation: SituationOption) => {
    const scores: Partial<Record<VisaType, number>> = {};

    if (selectedGoal) {
      Object.entries(selectedGoal.visaWeights).forEach(([visa, weight]) => {
        scores[visa as VisaType] = (scores[visa as VisaType] || 0) + weight;
      });
    }

    Object.entries(situation.visaWeights).forEach(([visa, weight]) => {
      scores[visa as VisaType] = (scores[visa as VisaType] || 0) + weight;
    });

    const maxScore = Math.max(...Object.values(scores), 1);
    const matchList: VisaMatch[] = Object.entries(scores)
      .filter(([, score]) => score > 0)
      .map(([type, score]) => ({
        type: type as VisaType,
        score: Math.round((score / maxScore) * 100),
        name: visaInfo[type as VisaType].name,
        tagline: visaInfo[type as VisaType].tagline,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setMatches(matchList);
    if (matchList.length > 0) {
      setSelectedVisa(matchList[0].type);
    }
  };

  const handleGoalSelect = (goal: GoalOption) => {
    setSelectedGoal(goal);
    setSituationStep(goal.nextStep);
    setCurrentStep(1);
  };

  const handleSituationSelect = (situation: SituationOption) => {
    calculateMatches(situation);
    setCurrentStep(2);
  };

  const handleStartJourney = () => {
    if (!selectedVisa || !targetDate) return;

    const progress = createProgress(selectedVisa);
    progress.targetDate = new Date(targetDate);
    saveProgress(progress);

    router.push(localePath("/visa/dashboard"));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  index < currentStep && "bg-primary text-primary-foreground",
                  index === currentStep && "bg-primary text-primary-foreground ring-4 ring-primary/30",
                  index > currentStep && "bg-elevated text-muted-foreground"
                )}
              >
                {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-1",
                    index < currentStep ? "bg-primary" : "bg-elevated"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {steps[currentStep].title}
          </h1>
          {steps[currentStep].subtitle && (
            <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
          )}
        </div>

        {/* Step 1: Goal Selection */}
        {currentStep === 0 && (
          <GoalStep onSelect={handleGoalSelect} />
        )}

        {/* Step 2: Situation Selection */}
        {currentStep === 1 && situationStep && (
          <SituationStep
            situationStep={situationStep}
            onSelect={handleSituationSelect}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {/* Step 3: Results */}
        {currentStep === 2 && (
          <ResultsStep
            matches={matches}
            onSelectVisa={(type) => {
              setSelectedVisa(type);
              setCurrentStep(3);
            }}
            onBack={() => setCurrentStep(1)}
            t={t}
          />
        )}

        {/* Step 4: Setup */}
        {currentStep === 3 && selectedVisa && (
          <SetupStep
            selectedVisa={selectedVisa}
            targetDate={targetDate}
            onTargetDateChange={setTargetDate}
            onStartJourney={handleStartJourney}
            onBack={() => setCurrentStep(2)}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
