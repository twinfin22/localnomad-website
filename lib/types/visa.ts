// =============================================================================
// Visa Type Definitions — v2
// Ported from v1 with pruning: no Quiz, Dashboard, Comparison, Checklist,
// User, API, or stub-related types.
// =============================================================================

// =============================================================================
// Country Types
// =============================================================================

export type Country = 'korea' | 'taiwan' | 'japan' | 'china' | 'southeast-asia';
export type CountryCode = 'kr' | 'tw' | 'jp' | 'cn' | 'sea';

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

export type JapanVisaType =
  | 'engineer-specialist'
  | 'hsw'
  | 'ssw1'
  | 'ssw2'
  | 'digital-nomad-jp'
  | 'business-manager';

export type ChinaVisaType =
  | 'z-visa'
  | 'k-visa'
  | 'x1-visa';

export type VisaType = KoreaVisaType | TaiwanVisaType | JapanVisaType | ChinaVisaType;

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

export const JAPAN_VISA_TYPES: JapanVisaType[] = [
  'engineer-specialist', 'hsw', 'ssw1',
  'ssw2', 'digital-nomad-jp', 'business-manager',
];

export function isJapanVisa(type: VisaType): type is JapanVisaType {
  return (JAPAN_VISA_TYPES as string[]).includes(type);
}

export const CHINA_VISA_TYPES: ChinaVisaType[] = [
  'z-visa', 'k-visa', 'x1-visa',
];

export function isChinaVisa(type: VisaType): type is ChinaVisaType {
  return (CHINA_VISA_TYPES as string[]).includes(type);
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
  priority?: 'essential' | 'detail';
  sentiment?: 'positive' | 'negative' | 'neutral';
  warnings?: string[];
  tips?: string[];
  category?: string;
}

export interface Document {
  id: string;
  name: string;
  nameLocal?: string;
  description: string;
  tips?: string[];
  where_to_get?: string;
  processing_time?: string;
  cost?: string;
  required: boolean;
  priority?: 'essential' | 'detail';
  warnings?: string[];
}

export interface ApplicationStep {
  id: string;
  step: number;
  title: string;
  description: string;
  duration?: string;
  tips?: string[];
  links?: { label: string; url: string }[];
  priority?: 'essential' | 'detail';
  warnings?: string[];
}

export interface FAQ {
  question: string;
  answer: string;
  priority?: 'essential' | 'detail';
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
  source?: 'discord' | 'reddit' | 'community' | 'official';
  verified: boolean;
  upvotes?: number;
  dateAdded?: string;
  section?: 'requirements' | 'documents' | 'process' | 'general';
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
  agency: 'TECO' | 'NIA' | 'MOL' | 'MOFA' | 'BOCA' | 'GoldCardOffice' | 'ISA' | 'Embassy' | 'PSB' | 'other';
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
    initialDetail?: string;
    extension?: string;
    maxTotal?: string;
    maxTotalDetail?: string;
  };
  fees: {
    application: string;
    applicationDetail?: string;
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
    governmentReview: string;
    governmentReviewDetail?: string;
    totalEndToEnd?: string;
    expedited?: string;
    notes?: string;
  };
  workPermission: {
    allowed: boolean;
    restrictions?: string[];
    notes?: string;
  };
  familyAllowed: boolean;
  nameLocal?: string;
  postArrivalSteps?: {
    id: string;
    title: string;
    deadline?: string;
    description: string;
    tips?: string[];
  }[];
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
  languageRequirement?: {
    required: boolean;
    minimumLevel?: string;
    notes?: string;
  };
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

// =============================================================================
// Japan-Specific Types
// =============================================================================

export interface JapanLanguageRequirement {
  required: boolean;
  minimumLevel?: string;
  notes?: string;
}

export interface JapanVisa extends VisaBase {
  country: 'jp';
  residenceStatus: string;
  sponsorRequired: boolean;
  coeRequired: boolean;
  agencySteps?: AgencyStep[];
  japaneseLanguage?: JapanLanguageRequirement;
  reentryGap?: string;
}

// =============================================================================
// China-Specific Types
// =============================================================================

export interface ChinaPSBRegistration {
  required: boolean;
  deadlineHours: number;
  notes?: string;
}

export interface ChinaVisa extends VisaBase {
  country: 'cn';
  workPermitCategory?: 'A' | 'B' | 'C';
  puLetterRequired?: boolean;
  psbRegistration?: ChinaPSBRegistration;
  residencePermitDeadline?: number;
  invitationRequired?: boolean;
  covaOnline?: boolean;
}

export type Visa = KoreaVisa | TaiwanVisa | JapanVisa | ChinaVisa;

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
