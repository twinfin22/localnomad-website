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

export const categoryColors: Record<string, string> = {
  work: "bg-primary/10 text-primary",
  study: "bg-blue-500/10 text-blue-500",
  residence: "bg-green-500/10 text-green-500",
  "digital-nomad": "bg-accent/10 text-accent",
  "job-seeking": "bg-orange-500/10 text-orange-500",
  "working-holiday": "bg-yellow-500/10 text-yellow-500",
  business: "bg-purple-500/10 text-purple-500",
  family: "bg-pink-500/10 text-pink-500",
  "ethnic-korean": "bg-indigo-500/10 text-indigo-500",
  "language-study": "bg-teal-500/10 text-teal-500",
};

export type TabId = "overview" | "documents" | "process" | "faqs";
