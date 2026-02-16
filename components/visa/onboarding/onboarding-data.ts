import {
  Briefcase,
  GraduationCap,
  Rocket,
  Compass,
  Building2,
  Search,
  Globe,
  Laptop,
} from "lucide-react";
import type { WizardStep, GoalOption, SituationOption } from "./onboarding-types";

export const steps: WizardStep[] = [
  { id: "goal", title: "What brings you to Korea?", subtitle: "Let's find the right visa for you" },
  { id: "situation", title: "Tell us more", subtitle: "This helps us narrow down your options" },
  { id: "result", title: "Your Closest Match", subtitle: "Based on your answers" },
  { id: "setup", title: "Set Your Target", subtitle: "When do you want to be in Korea?" },
];

export const goalOptions: GoalOption[] = [
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

export const situationOptions: Record<string, SituationOption[]> = {
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

export const visaInfo: Record<string, { name: string; tagline: string }> = {
  "e-7": { name: "E-7 Professional Work Visa", tagline: "For skilled workers with job offers" },
  "d-2": { name: "D-2 Student Visa", tagline: "For degree and language programs" },
  "d-10": { name: "D-10 Job Seeker Visa", tagline: "Find a job while in Korea" },
  "f-1-d": { name: "F-1-D Digital Nomad Visa", tagline: "Work remotely from Korea" },
  "f-2": { name: "F-2 Long-term Residence", tagline: "For points-based residence" },
  "h-1": { name: "H-1 Working Holiday Visa", tagline: "Work and travel for young adults" },
  "e-2": { name: "E-2 English Teaching Visa", tagline: "Teach English in Korea" },
  "d-7": { name: "D-7 Intra-Company Transfer", tagline: "Transfer to Korea with your company" },
  "d-8": { name: "D-8 Corporate Investment Visa", tagline: "Start a business in Korea" },
  "f-6": { name: "F-6 Marriage Migration Visa", tagline: "Live with your Korean spouse" },
  "f-4": { name: "F-4 Overseas Korean Visa", tagline: "For ethnic Koreans abroad" },
  "d-4": { name: "D-4 Language Training Visa", tagline: "Study Korean in Korea" },
};
