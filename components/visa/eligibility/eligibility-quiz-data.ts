import {
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
import type { VisaType } from "@/lib/visa/types";

export const categoryIcons: Record<string, typeof Briefcase> = {
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

export interface Question {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    visaPoints: Partial<Record<VisaType, number>>;
  }[];
}

export const questions: Question[] = [
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

export interface VisaResult {
  type: VisaType;
  visa: import("@/lib/visa/types").VisaInfo;
  score: number;
  maxScore: number;
  percentage: number;
  matchReasons: string[];
}
