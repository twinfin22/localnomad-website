import type { Briefcase, Building2 } from "lucide-react";
import type { VisaType } from "@/lib/visa/types";

export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
}

export interface GoalOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Briefcase;
  nextStep: string;
  visaWeights: Partial<Record<VisaType, number>>;
}

export interface SituationOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Building2;
  visaWeights: Partial<Record<VisaType, number>>;
}

export interface VisaMatch {
  type: VisaType;
  score: number;
  name: string;
  tagline: string;
}
