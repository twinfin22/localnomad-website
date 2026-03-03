// =============================================================================
// SEA Digital Nomad Visa Comparison Types
// Flat comparison format — not VisaBase-based.
// =============================================================================

export interface SEAVisaComparison {
  country: string;
  flag: string;
  visaName: string;
  visaValidity: string;
  singleStayDuration: string;
  maxStayDuration: string;
  incomeRequirement: string;
  applicationFee: string;
  processingTime: string;
  workPermission: string;
  tax: string;
  familyAccompaniment: string;
  healthInsurance: string;
  renewalPossible: boolean;
  pros: string[];
  cons: string[];
  officialLink: string;
}
