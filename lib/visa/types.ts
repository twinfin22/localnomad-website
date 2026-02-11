// =============================================================================
// Visa Dashboard - Type Definitions
// =============================================================================

/**
 * Supported visa types in the system
 */
export type VisaType = "d-10" | "e-7" | "f-2" | "f-1-d" | "d-2" | "h-1";

/**
 * Supported locales for content
 */
export type Locale = "en" | "fr" | "zh";

/**
 * Visa category classification
 */
export type VisaCategory =
  | "work"
  | "study"
  | "residence"
  | "digital-nomad"
  | "job-seeking";

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

  // Eligibility
  targetAudience: string[];
  eligibility: Requirement[];

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
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
}

/**
 * Complete checklist for a visa type
 */
export interface VisaChecklist {
  visaType: VisaType;
  categories: ChecklistCategory[];
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
 * Single quiz question
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
 * Quiz result with recommended visas
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
