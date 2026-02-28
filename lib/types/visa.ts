// =============================================================================
// Visa Type Definitions — v2
// Ported from v1 with pruning: no Quiz, Dashboard, Comparison, Checklist,
// User, API, or stub-related types.
// =============================================================================

// =============================================================================
// Country Types
// =============================================================================

export type Country = 'korea' | 'taiwan';
export type CountryCode = 'kr' | 'tw';

// =============================================================================
// Country-Scoped Visa Types
// =============================================================================

export type KoreaVisaType =
  | 'd-10'
  | 'e-7'
  | 'f-2'
  | 'f-1-d'
  | 'd-2'
  | 'h-1'
  | 'e-2'
  | 'd-7'
  | 'd-8'
  | 'f-6'
  | 'f-4'
  | 'd-4';

export type TaiwanVisaType =
  | 'gold-card'
  | 'dnv'
  | 'work-arc'
  | 'visitor'
  | 'entrepreneur'
  | 'student'
  | 'aprc'
  | 'plum-blossom'
  | 'dependent-arc'
  | 'seeking-employment'
  | 'working-holiday-tw';

export type VisaType = KoreaVisaType | TaiwanVisaType;

// =============================================================================
// Type Registries & Guards
// =============================================================================

export const KOREA_VISA_TYPES: KoreaVisaType[] = [
  'd-10', 'e-7', 'f-2', 'f-1-d', 'd-2', 'h-1',
  'e-2', 'd-7', 'd-8', 'f-6', 'f-4', 'd-4',
];

export const TAIWAN_VISA_TYPES: TaiwanVisaType[] = [
  'gold-card', 'dnv', 'work-arc', 'visitor',
  'entrepreneur', 'student', 'aprc',
  'plum-blossom', 'dependent-arc', 'seeking-employment',
  'working-holiday-tw',
];

export function isKoreaVisa(type: VisaType): type is KoreaVisaType {
  return (KOREA_VISA_TYPES as string[]).includes(type);
}

export function isTaiwanVisa(type: VisaType): type is TaiwanVisaType {
  return (TAIWAN_VISA_TYPES as string[]).includes(type);
}

// =============================================================================
// Visa Category
// =============================================================================

export type VisaCategory =
  | 'work'
  | 'study'
  | 'residence'
  | 'digital-nomad'
  | 'job-seeking'
  | 'working-holiday'
  | 'business'
  | 'family'
  | 'ethnic-korean'
  | 'language-study'
  | 'gold-card'
  | 'investment'
  | 'visitor';

// =============================================================================
// Supporting Types
// =============================================================================

export interface Requirement {
  id: string;
  label: string;
  description?: string;
  required: boolean;
}

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

export interface ApplicationStep {
  id: string;
  step: number;
  title: string;
  description: string;
  duration?: string;
  tips?: string[];
  links?: { label: string; url: string }[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface VisaTransitionPath {
  type: VisaType;
  name: string;
  requirements: string;
  timeline: string;
  documents: string[];
  notes: string;
}

export interface CommunityTip {
  id: string;
  tip: string;
  source: 'discord' | 'reddit' | 'community' | 'official';
  verified: boolean;
  upvotes?: number;
  dateAdded?: string;
}

export interface VisaRenewalInfo {
  eligible: boolean;
  maxExtensions?: number;
  maxTotalStay?: string;
  requirements: string[];
  documents: string[];
  applyBeforeDays: number;
  processingTime?: string;
  fees?: string;
}

// =============================================================================
// Income Requirement Types
// =============================================================================

export interface GNIBasedIncome {
  year: number;
  gniPerCapita: number;
  multiplier: number;
  threshold: number;
  source: string;
  lastUpdated: string;
}

export interface FixedIncomeRequirement {
  amount: number;
  currency: string;
  period: 'annual' | 'monthly';
  notes?: string;
}

// =============================================================================
// Taiwan-Specific Types (from tw-types.ts)
// =============================================================================

export interface TECOAuthenticationInfo {
  country: string;
  tecoOffice: string;
  tecoUrl: string;
  documentsRequired: string[];
  processingDays: number;
  fees: { amount: number; currency: string };
  notes?: string;
}

export interface AgencyStep {
  order: number;
  agency: 'TECO' | 'NIA' | 'MOL' | 'MOFA' | 'BOCA' | 'GoldCardOffice' | 'other';
  agencyFullName: string;
  action: string;
  description: string;
  url?: string;
  processingDays?: number;
  fees?: { amount: number; currency: string };
  documentsRequired?: string[];
  tips?: string[];
  dependsOn?: number;
}

// =============================================================================
// Visa Base & Country Extensions
// =============================================================================

export interface VisaBase {
  type: VisaType;
  name: string;
  shortName: string;
  category: VisaCategory;
  description: string;
  tagline: string;
  keyRequirement?: string;
  targetAudience: string[];
  eligibility: Requirement[];
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
  incomeRequirement?: {
    amount: string;
    currency: string;
    period: string;
    notes?: string;
    proofMethods?: string[];
  };
  documents: Document[];
  applicationSteps: ApplicationStep[];
  processingTime: {
    typical: string;
    expedited?: string;
    notes?: string;
  };
  workPermission: {
    allowed: boolean;
    restrictions?: string[];
    notes?: string;
  };
  faqs: FAQ[];
  tips: string[];
  warnings?: string[];
  relatedVisas?: VisaType[];
  communityTips?: CommunityTip[];
  renewal?: VisaRenewalInfo;
  pathsTo?: VisaTransitionPath[];
  pathsFrom?: VisaTransitionPath[];
  lastUpdated: string;
  officialLinks: { label: string; url: string }[];
}

export interface KoreaVisa extends VisaBase {
  country: 'kr';
  insuranceRequirement?: {
    minimumCoverage: string;
    type: string;
    notes: string;
    source?: string;
  };
  gniBasedIncome?: GNIBasedIncome;
  fixedIncomeRequirement?: FixedIncomeRequirement;
  taxImplications?: {
    threshold: string;
    notes: string;
    source: string;
  };
}

export interface TaiwanVisa extends VisaBase {
  country: 'tw';
  agencySteps?: AgencyStep[];
  tecoInfo?: TECOAuthenticationInfo;
  goldCardFields?: {
    categories: string[];
    openWorkPermit: boolean;
    taxBenefit?: string;
  };
  goldCardComparison?: {
    disclaimer: string;
    comparisonTable: { criterion: string; dnv: string; goldCard: string }[];
  };
  tecoRouting?: {
    description: string;
    notes: string;
    officialLink: { label: string; url: string };
    exampleRegions: { region: string; office: string }[];
  };
}

export type Visa = KoreaVisa | TaiwanVisa;

// =============================================================================
// Summary type for listings
// =============================================================================

export interface VisaSummary {
  type: VisaType;
  name: string;
  shortName: string;
  category: VisaCategory;
  tagline: string;
  country: CountryCode;
}
