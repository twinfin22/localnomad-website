// =============================================================================
// Visa Dashboard - Type Definitions
// =============================================================================

import type { Locale as I18nLocale, Country } from "@/lib/i18n/config";
import type { AgencyStep, TECOAuthenticationInfo } from "./tw-types";

// =============================================================================
// Country-Scoped Visa Types
// =============================================================================

/**
 * Korea visa type slugs (unchanged from original)
 */
export type KoreaVisaType =
  | "d-10"
  | "e-7"
  | "f-2"
  | "f-1-d"
  | "d-2"
  | "h-1"
  // Stub visa types (coming soon)
  | "e-2"
  | "d-7"
  | "d-8"
  | "f-6"
  | "f-4"
  | "d-4";

/**
 * Taiwan visa type slugs
 */
export type TaiwanVisaType =
  // Phase 1 (full guides)
  | "gold-card"
  | "dnv"
  | "work-arc"
  | "visitor"
  // Phase 2 (full guides)
  | "entrepreneur"
  | "student"
  | "aprc"
  // Stubs (coming soon)
  | "plum-blossom"
  | "dependent-arc"
  | "seeking-employment"
  | "working-holiday-tw";

/**
 * Union of all visa types across all countries
 */
export type VisaType = KoreaVisaType | TaiwanVisaType;

// =============================================================================
// Visa Type Registries & Type Guards
// =============================================================================

export const KOREA_VISA_TYPES: KoreaVisaType[] = [
  "d-10", "e-7", "f-2", "f-1-d", "d-2", "h-1",
  "e-2", "d-7", "d-8", "f-6", "f-4", "d-4",
];

export const TAIWAN_VISA_TYPES: TaiwanVisaType[] = [
  "gold-card", "dnv", "work-arc", "visitor",
  "entrepreneur", "student", "aprc",
  "plum-blossom", "dependent-arc", "seeking-employment",
  "working-holiday-tw",
];

export function isKoreaVisa(type: VisaType): type is KoreaVisaType {
  return (KOREA_VISA_TYPES as string[]).includes(type);
}

export function isTaiwanVisa(type: VisaType): type is TaiwanVisaType {
  return (TAIWAN_VISA_TYPES as string[]).includes(type);
}

/**
 * Country-scoped visa identifier (for APIs, DB, routing)
 */
export interface CountryScopedVisa {
  country: Country;
  type: VisaType;
}

/**
 * Supported locales for visa content
 * Re-export from i18n config for consistency
 */
export type Locale = I18nLocale;

/**
 * Visa category classification
 */
export type VisaCategory =
  | "work"
  | "study"
  | "residence"
  | "digital-nomad"
  | "job-seeking"
  | "working-holiday"
  | "business"
  | "family"
  | "ethnic-korean"
  | "language-study"
  // Taiwan categories
  | "gold-card"
  | "investment"
  | "visitor";

// =============================================================================
// Visa Information Types
// =============================================================================

/**
 * Basic requirement item with description
 */
export interface Requirement {
  id: string;
  label: string;
  description?: string;
  required: boolean;
}

/**
 * Document required for visa application
 */
export interface Document {
  id: string;
  name: string;
  nameKorean?: string;
  description: string;
  tips?: string[];
  where_to_get?: string;
  processing_time?: string;
  cost?: string;
  required: boolean;
}

/**
 * Step in the visa application process
 */
export interface ApplicationStep {
  id: string;
  step: number;
  title: string;
  description: string;
  duration?: string;
  tips?: string[];
  links?: {
    label: string;
    url: string;
  }[];
}

/**
 * FAQ item for visa type
 */
export interface FAQ {
  question: string;
  answer: string;
}

/**
 * Complete visa information structure
 */
export interface VisaInfo {
  // Basic info
  type: VisaType;
  name: string;
  shortName: string;
  category: VisaCategory;
  description: string;
  tagline: string;
  keyRequirement?: string;

  // Stub indicator for coming-soon pages
  isStub?: boolean;

  // Eligibility
  targetAudience: string[];
  eligibility: Requirement[];

  // NEW: Interactive eligibility questions for quick check
  eligibilityQuestions?: EligibilityQuestion[];

  // Duration & Fees
  duration: {
    initial: string;
    extension?: string;
    maxTotal?: string;
  };
  fees: {
    application: string;
    extension?: string;
    notes?: string;
  };

  // Requirements
  incomeRequirement?: {
    amount: string;
    currency: string;
    period: string;
    notes?: string;
  };

  // NEW: GNI-based income requirement (for F-2, F-1-D)
  gniBasedIncome?: GNIBasedIncome;

  // NEW: Fixed USD income requirement (for F-1-D)
  fixedIncomeRequirement?: FixedIncomeRequirement;

  documents: Document[];

  // Process
  applicationSteps: ApplicationStep[];
  processingTime: {
    typical: string;
    expedited?: string;
    notes?: string;
  };

  // Permissions & Restrictions
  workPermission: {
    allowed: boolean;
    restrictions?: string[];
    notes?: string;
  };

  // Additional Info
  faqs: FAQ[];
  tips: string[];
  warnings?: string[];
  relatedVisas?: VisaType[];

  // NEW: Community tips from Discord/Reddit research
  communityTips?: CommunityTip[];

  // NEW: Renewal/extension information
  renewal?: VisaRenewalInfo;

  // NEW: Visa paths this visa can lead to (rich transition details)
  pathsTo?: VisaTransitionPath[];

  // NEW: Visa paths that can lead to this visa (rich transition details)
  pathsFrom?: VisaTransitionPath[];

  // === Country identifier (optional for backward compat; Korea data may omit) ===
  country?: string;

  // === Taiwan-specific optional fields ===
  agencySteps?: AgencyStep[];
  tecoInfo?: TECOAuthenticationInfo;
  goldCardFields?: {
    categories: string[];
    openWorkPermit: boolean;
    taxBenefit?: string;
  };

  // Metadata
  lastUpdated: string;
  officialLinks: {
    label: string;
    url: string;
  }[];
}

// =============================================================================
// Checklist Types
// =============================================================================

/**
 * Document category for grouping in checklists
 */
export type DocumentCategory =
  | "identity"
  | "financial"
  | "background"
  | "employment"
  | "education"
  | "insurance"
  | "accommodation"
  | "application"
  | "supplementary";

/**
 * Difficulty level for document procurement
 */
export type DocumentDifficulty = "easy" | "medium" | "hard";

/**
 * Enhanced document for checklist with additional metadata
 */
export interface ChecklistDocument extends Document {
  nameKorean?: string;
  category: DocumentCategory;
  estimatedTime: string;
  difficulty: DocumentDifficulty;
  commonMistakes?: string[];
  validityPeriod?: string;
  templateUrl?: string;
  sampleUrl?: string;
  order: number;
}

/**
 * Single checklist item
 */
export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  description?: string;
  tips?: string[];
  required: boolean;
  order: number;
}

/**
 * Grouped checklist structure
 */
export interface ChecklistCategory {
  id: DocumentCategory | string; // Allow string for backward compatibility
  name: string;
  nameKorean?: string;
  description?: string;
  icon?: string;
  items: ChecklistItem[];
  order?: number;
}

/**
 * Complete checklist for a visa type
 */
export interface VisaChecklist {
  visaType: VisaType;
  categories: ChecklistCategory[];
}

// =============================================================================
// Eligibility & Income Requirement Types
// =============================================================================

/**
 * Interactive eligibility question for visa detail pages
 */
export interface EligibilityQuestion {
  id: string;
  question: string;
  helpText?: string;
  mismatchNote?: string;
  publishedRequirement?: string;
}

/**
 * GNI-based income requirement (for F-2, F-1-D)
 */
export interface GNIBasedIncome {
  year: number;
  gniPerCapita: number; // in KRW
  multiplier: number;
  threshold: number; // calculated: gniPerCapita * multiplier
  source: string;
  lastUpdated: string;
}

/**
 * Fixed income requirement (for F-1-D USD threshold)
 */
export interface FixedIncomeRequirement {
  amount: number;
  currency: string;
  period: "annual" | "monthly";
  notes?: string;
}

/**
 * Detailed visa transition path with requirements and documents
 */
export interface VisaTransitionPath {
  type: VisaType;
  name: string;
  requirements: string;
  timeline: string;
  documents: string[];
  notes: string;
}

/**
 * Community tip from Discord/Reddit research
 */
export interface CommunityTip {
  id: string;
  tip: string;
  source: "discord" | "reddit" | "community" | "official";
  verified: boolean;
  upvotes?: number;
  dateAdded?: string;
}

/**
 * Renewal/extension information for a visa
 */
export interface VisaRenewalInfo {
  eligible: boolean;
  maxExtensions?: number;
  maxTotalStay?: string;
  requirements: string[];
  documents: string[]; // Document IDs required for renewal
  applyBeforeDays: number;
  processingTime?: string;
  fees?: string;
}

// =============================================================================
// User Progress Types (for Supabase)
// =============================================================================

/**
 * User profile stored in database
 */
export interface UserProfile {
  id: string;
  email: string;
  locale: Locale;
  created_at: string;
}

/**
 * User's visa application progress
 */
export interface UserVisaProgress {
  id: string;
  user_id: string;
  visa_type: VisaType;
  current_step: number;
  target_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * User's checklist item status
 */
export interface UserChecklistItem {
  id: string;
  user_id: string;
  visa_type: VisaType;
  item_id: string;
  completed: boolean;
  completed_at?: string;
}

/**
 * User's notification preferences
 */
export interface NotificationSettings {
  user_id: string;
  email_reminders: boolean;
  expiry_warnings: boolean;
  policy_updates: boolean;
}

// =============================================================================
// Quiz / Eligibility Checker Types
// =============================================================================

/**
 * Quiz flow steps
 */
export type QuizStep =
  | "nationality"
  | "current-status"
  | "goal"
  | "background"
  | "results";

/**
 * Match level for visa recommendations (NOT approval probability)
 * This indicates how well the user's situation aligns with published requirements
 */
export type MatchLevel = "strong" | "moderate" | "possible";

/**
 * User's current status in Korea
 */
export type CurrentStatus =
  | "outside-korea"
  | "tourist"
  | "student"
  | "worker"
  | "other-visa";

/**
 * User's primary goal for visa
 */
export type VisaGoal =
  | "remote-work"
  | "korean-employment"
  | "study"
  | "long-term-residence"
  | "business"
  | "working-holiday";

/**
 * Quiz answers collected from user
 */
export interface QuizAnswers {
  nationality?: string;
  currentStatus?: CurrentStatus;
  existingVisa?: VisaType;
  goal?: VisaGoal;
  // Conditional background questions
  annualIncome?: number; // in USD
  incomeCurrency?: string;
  hasJobOffer?: boolean;
  education?: "high-school" | "bachelors" | "masters" | "phd";
  workExperience?: "0-2" | "2-5" | "5-10" | "10+";
  koreanLevel?: "none" | "topik-1-2" | "topik-3-4" | "topik-5-6";
  age?: number;
  hasHealthInsurance?: boolean;
  hasCriminalRecord?: boolean;
}

/**
 * Single quiz question configuration
 */
export interface QuizQuestionConfig {
  id: string;
  step: QuizStep;
  title: string;
  subtitle?: string;
  type: "single" | "multiple" | "number" | "text";
  options?: QuizOption[];
  conditional?: {
    dependsOn: keyof QuizAnswers;
    showWhen: (string | boolean | number)[];
  };
  required: boolean;
}

/**
 * Option for quiz questions
 */
export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Single visa recommendation
 */
export interface VisaRecommendation {
  visaType: VisaType;
  matchLevel: MatchLevel;
  matchReasons: string[];
  warningReasons?: string[];
  path?: VisaPathStep[];
}

/**
 * Step in a multi-visa path (e.g., F-1-D → E-7 → F-2)
 */
export interface VisaPathStep {
  order: number;
  visaType: VisaType;
  visaName: string;
  duration: string;
  description: string;
  keyRequirements?: string[];
}

/**
 * Complete visa path for long-term planning
 */
export interface VisaPath {
  id: string;
  name: string;
  description: string;
  steps: VisaPathStep[];
  totalDuration: string;
  suitableFor: string[];
}

/**
 * Legacy quiz question (for compatibility)
 * @deprecated Use QuizQuestionConfig instead
 */
export interface QuizQuestion {
  id: string;
  question: string;
  type: "single" | "multiple" | "text" | "number";
  options?: {
    value: string;
    label: string;
  }[];
  required: boolean;
}

/**
 * Legacy quiz result (for compatibility)
 * @deprecated Use VisaRecommendation[] instead
 */
export interface QuizResult {
  recommendedVisas: {
    visaType: VisaType;
    matchScore: number;
    reasons: string[];
  }[];
  disqualifiedVisas: {
    visaType: VisaType;
    reasons: string[];
  }[];
}

// =============================================================================
// Comparison Types
// =============================================================================

/**
 * Comparison attribute for visa comparison table
 */
export interface ComparisonAttribute {
  key: string;
  label: string;
  category: "basic" | "requirements" | "benefits" | "process";
}

/**
 * Visa data formatted for comparison
 */
export interface VisaComparisonData {
  visaType: VisaType;
  name: string;
  attributes: Record<string, string | boolean | string[]>;
}

// =============================================================================
// Dashboard Types
// =============================================================================

/**
 * Visa lifecycle states
 */
export type VisaState =
  | "NO_VISA"
  | "PREPARING"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "EXPIRING"
  | "EXPIRED";

/**
 * Health score interpretation
 */
export interface HealthScoreInterpretation {
  labelKey: string;
  color: "emerald" | "cyan" | "amber" | "slate" | "red";
  messageKey: string;
}

/**
 * Factors used to calculate health score
 */
export interface HealthScoreFactors {
  documentsCompleted: number;
  documentsTotal: number;
  daysUntilTarget: number | null;
  insuranceValid: boolean;
  insuranceExpiresInDays: number | null;
  state: VisaState;
}

/**
 * Dashboard summary card data
 */
export interface DashboardSummary {
  visaType: VisaType;
  visaName: string;
  currentStep: number;
  totalSteps: number;
  completedDocuments: number;
  totalDocuments: number;
  daysUntilTarget?: number;
  nextAction?: {
    title: string;
    description: string;
    deadline?: string;
    urgency?: "low" | "medium" | "high";
    link?: string;
  };
}

/**
 * Timeline event for progress visualization
 */
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: "completed" | "current" | "upcoming" | "warning";
  step?: number;
}

/**
 * Deadline entry for tracking
 */
export interface DeadlineEntry {
  id: string;
  type: "visa_expiry" | "insurance_expiry" | "document_expiry" | "183_day" | "renewal_window" | "custom";
  title: string;
  date: string;
  daysRemaining: number;
  urgency: "low" | "medium" | "high" | "critical";
  description?: string;
  actionUrl?: string;
}

/**
 * User's visa progress stored in database
 */
export interface VisaProgress {
  id: string;
  visaType: VisaType;
  state: VisaState;
  targetDate?: Date;
  submittedDate?: Date;
  approvedDate?: Date;
  entryDate?: Date;
  expiryDate?: Date;
  notes?: string;
  healthScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Paginated response for lists
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}
