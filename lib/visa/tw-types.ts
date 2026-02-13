// =============================================================================
// Taiwan-Specific Visa Type Definitions
// =============================================================================

/**
 * TECO (Taipei Economic and Cultural Office) document authentication info.
 * Taiwan uses TECO offices abroad instead of traditional embassies.
 */
export interface TECOAuthenticationInfo {
  country: string;
  tecoOffice: string;
  tecoUrl: string;
  documentsRequired: string[];
  processingDays: number;
  fees: {
    amount: number;
    currency: string;
  };
  notes?: string;
}

/**
 * Step in Taiwan's multi-agency application process.
 * Unlike Korea (single HiKorea portal), Taiwan involves:
 * - TECO (abroad)
 * - NIA (National Immigration Agency)
 * - MOL (Ministry of Labor) for work permits
 * - MOFA (Ministry of Foreign Affairs)
 * - BOCA (Bureau of Consular Affairs)
 * - GoldCardOffice (cross-ministry Gold Card portal)
 */
export interface AgencyStep {
  order: number;
  agency:
    | "TECO"
    | "NIA"
    | "MOL"
    | "MOFA"
    | "BOCA"
    | "GoldCardOffice"
    | "other";
  agencyFullName: string;
  action: string;
  description: string;
  url?: string;
  processingDays?: number;
  fees?: {
    amount: number;
    currency: string;
  };
  documentsRequired?: string[];
  tips?: string[];
  dependsOn?: number;
}

/**
 * Tax residency day tracking for Taiwan's 183-day rule.
 * Taiwan uses calendar-year residency (not rolling window like Korea).
 */
export interface TaxResidencyDay {
  year: number;
  daysPresent: number;
  isResident: boolean;
  taxRate: "resident" | "non-resident";
  notes?: string;
}

/**
 * Visa-run / landing visa entry for Taiwan.
 * Common pattern: leave and re-enter to reset visa-exempt stay.
 */
export interface VisaRunEntry {
  entryDate: string;
  exitDate: string;
  destination: string;
  entryType: "visa-exempt" | "visitor-visa" | "landing-visa";
  daysGranted: number;
  purpose?: string;
}
