"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  GraduationCap,
  Rocket,
  Compass,
  Building2,
  Search,
  Globe,
  Laptop,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createProgress, saveProgress } from "@/lib/visa/stateMachine";
import type { VisaType } from "@/lib/visa/types";

// =============================================================================
// Types
// =============================================================================

interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
}

interface GoalOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Briefcase;
  nextStep: string;
  visaWeights: Partial<Record<VisaType, number>>;
}

interface SituationOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Building2;
  visaWeights: Partial<Record<VisaType, number>>;
}

interface VisaMatch {
  type: VisaType;
  score: number;
  name: string;
  tagline: string;
}

// =============================================================================
// Data
// =============================================================================

const steps: WizardStep[] = [
  { id: "goal", title: "What brings you to Korea?", subtitle: "Let's find the right visa for you" },
  { id: "situation", title: "Tell us more", subtitle: "This helps us narrow down your options" },
  { id: "result", title: "Your Closest Match", subtitle: "Based on your answers" },
  { id: "setup", title: "Set Your Target", subtitle: "When do you want to be in Korea?" },
];

const goalOptions: GoalOption[] = [
  {
    id: "work",
    label: "Work at a company",
    description: "Employment with a Korean employer",
    icon: Briefcase,
    nextStep: "work-situation",
    visaWeights: { "e-7": 3, "d-10": 1 },
  },
  {
    id: "business",
    label: "Start a business",
    description: "Entrepreneurship or startup",
    icon: Rocket,
    nextStep: "business-situation",
    visaWeights: { "f-1-d": 2 },
  },
  {
    id: "study",
    label: "Study",
    description: "University or language program",
    icon: GraduationCap,
    nextStep: "study-situation",
    visaWeights: { "d-2": 3 },
  },
  {
    id: "explore",
    label: "Just exploring",
    description: "Learning about visa options",
    icon: Compass,
    nextStep: "explore-situation",
    visaWeights: {},
  },
];

const situationOptions: Record<string, SituationOption[]> = {
  "work-situation": [
    {
      id: "job-offer",
      label: "I have a job offer",
      description: "From a Korean company",
      icon: Building2,
      visaWeights: { "e-7": 3 },
    },
    {
      id: "job-seeking",
      label: "I'm looking for a job",
      description: "Want to job hunt in Korea",
      icon: Search,
      visaWeights: { "d-10": 3, "e-7": 1 },
    },
    {
      id: "remote",
      label: "I work remotely",
      description: "For a company outside Korea",
      icon: Laptop,
      visaWeights: { "f-1-d": 3, "h-1": 2 },
    },
    {
      id: "transfer",
      label: "Company transfer",
      description: "Relocating within my company",
      icon: Globe,
      visaWeights: { "e-7": 3 },
    },
  ],
  "business-situation": [
    {
      id: "startup",
      label: "Launch a startup",
      description: "Tech or innovative business",
      icon: Rocket,
      visaWeights: { "f-1-d": 3 },
    },
    {
      id: "investment",
      label: "Invest in Korea",
      description: "Investment-based residence",
      icon: Building2,
      visaWeights: { "f-2": 2 },
    },
  ],
  "study-situation": [
    {
      id: "degree",
      label: "Degree program",
      description: "Bachelor's, Master's, or PhD",
      icon: GraduationCap,
      visaWeights: { "d-2": 3 },
    },
    {
      id: "language",
      label: "Language program",
      description: "Korean language study",
      icon: Globe,
      visaWeights: { "d-2": 2 },
    },
  ],
  "explore-situation": [
    {
      id: "work-interest",
      label: "Interested in working",
      description: "Exploring job opportunities",
      icon: Briefcase,
      visaWeights: { "e-7": 2, "d-10": 2 },
    },
    {
      id: "study-interest",
      label: "Interested in studying",
      description: "Considering education options",
      icon: GraduationCap,
      visaWeights: { "d-2": 2 },
    },
    {
      id: "long-term",
      label: "Long-term residence",
      description: "Want to live in Korea",
      icon: Globe,
      visaWeights: { "f-2": 2, "f-1-d": 1 },
    },
  ],
};

const visaInfo: Record<VisaType, { name: string; tagline: string }> = {
  "e-7": { name: "E-7 Professional Work Visa", tagline: "For skilled workers with job offers" },
  "d-2": { name: "D-2 Student Visa", tagline: "For degree and language programs" },
  "d-10": { name: "D-10 Job Seeker Visa", tagline: "Find a job while in Korea" },
  "f-1-d": { name: "F-1-D Digital Nomad Visa", tagline: "Work remotely from Korea" },
  "f-2": { name: "F-2 Long-term Residence", tagline: "For points-based residence" },
  "h-1": { name: "H-1 Working Holiday Visa", tagline: "Work and travel for young adults" },
  // Stub visas
  "e-2": { name: "E-2 English Teaching Visa", tagline: "Teach English in Korea" },
  "d-7": { name: "D-7 Intra-Company Transfer", tagline: "Transfer to Korea with your company" },
  "d-8": { name: "D-8 Corporate Investment Visa", tagline: "Start a business in Korea" },
  "f-6": { name: "F-6 Marriage Migration Visa", tagline: "Live with your Korean spouse" },
  "f-4": { name: "F-4 Overseas Korean Visa", tagline: "For ethnic Koreans abroad" },
  "d-4": { name: "D-4 Language Training Visa", tagline: "Study Korean in Korea" },
};

// =============================================================================
// Component
// =============================================================================

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [situationStep, setSituationStep] = useState<string | null>(null);
  const [selectedSituation, setSelectedSituation] = useState<SituationOption | null>(null);
  const [matches, setMatches] = useState<VisaMatch[]>([]);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [targetDate, setTargetDate] = useState<string>("");

  // Calculate visa matches
  // Accepts an explicit situation parameter to avoid reading stale React state,
  // since setState is async and the value may not be available immediately.
  const calculateMatches = (situation: SituationOption) => {
    const scores: Partial<Record<VisaType, number>> = {};

    // Add goal weights
    if (selectedGoal) {
      Object.entries(selectedGoal.visaWeights).forEach(([visa, weight]) => {
        scores[visa as VisaType] = (scores[visa as VisaType] || 0) + weight;
      });
    }

    // Add situation weights from the passed-in value (not from state)
    Object.entries(situation.visaWeights).forEach(([visa, weight]) => {
      scores[visa as VisaType] = (scores[visa as VisaType] || 0) + weight;
    });

    // Convert to sorted matches
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

  // Handle goal selection
  const handleGoalSelect = (goal: GoalOption) => {
    setSelectedGoal(goal);
    setSituationStep(goal.nextStep);
    setCurrentStep(1);
  };

  // Handle situation selection
  const handleSituationSelect = (situation: SituationOption) => {
    setSelectedSituation(situation);
    calculateMatches(situation);
    setCurrentStep(2);
  };

  // Handle starting the journey
  const handleStartJourney = () => {
    if (!selectedVisa || !targetDate) return;

    // Create and save progress
    const progress = createProgress(selectedVisa);
    progress.targetDate = new Date(targetDate);
    saveProgress(progress);

    // Navigate to dashboard
    router.push("/visa/dashboard");
  };

  // Calculate days until target
  const getDaysUntil = () => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntil = getDaysUntil();

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
          <div className="grid gap-4">
            {goalOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleGoalSelect(option)}
                className="bg-surface border border-border rounded-xl p-6 text-left group hover:border-border-hover hover:bg-elevated transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <option.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {option.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Situation Selection */}
        {currentStep === 1 && situationStep && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {situationOptions[situationStep]?.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSituationSelect(option)}
                  className="bg-surface border border-border rounded-xl p-6 text-left group hover:border-border-hover hover:bg-elevated transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <option.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {option.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentStep(0)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto mt-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {matches.map((match, index) => (
              <button
                key={match.type}
                onClick={() => {
                  setSelectedVisa(match.type);
                  setCurrentStep(3);
                }}
                className={cn(
                  "w-full bg-surface border border-border rounded-xl p-6 text-left transition-all",
                  index === 0 && "ring-2 ring-primary bg-primary/5"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
                    index === 0 ? "bg-primary text-primary-foreground" : "bg-elevated text-muted-foreground"
                  )}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {match.name}
                      </h3>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        index === 0 ? "bg-primary text-primary-foreground" : "bg-elevated text-muted-foreground"
                      )}>
                        {match.score}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{match.tagline}</p>
                  </div>
                  {index === 0 && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <span>Start</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            ))}
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto mt-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Step 4: Setup */}
        {currentStep === 3 && selectedVisa && (
          <div className="space-y-8">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {visaInfo[selectedVisa].name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{visaInfo[selectedVisa].tagline}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-foreground mb-2 block">
                    When do you want to be in Korea?
                  </span>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 rounded-xl bg-elevated border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </label>

                {daysUntil !== null && daysUntil > 0 && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {daysUntil} days to prepare
                        </p>
                        <p className="text-xs text-muted-foreground">
                          We&apos;ll help you track your progress
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleStartJourney}
              disabled={!targetDate}
              variant="primary"
              className="w-full py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start My Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to results</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
