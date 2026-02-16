import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { goalOptions, situationOptions } from "./onboarding-data";
import type { GoalOption, SituationOption } from "./onboarding-types";

interface GoalStepProps {
  onSelect: (goal: GoalOption) => void;
}

export function GoalStep({ onSelect }: GoalStepProps) {
  return (
    <div className="grid gap-4">
      {goalOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option)}
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
  );
}

interface SituationStepProps {
  situationStep: string;
  onSelect: (situation: SituationOption) => void;
  onBack: () => void;
}

export function SituationStep({ situationStep, onSelect, onBack }: SituationStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {situationOptions[situationStep]?.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
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
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>
    </div>
  );
}
