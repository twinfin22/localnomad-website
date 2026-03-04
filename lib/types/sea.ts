// =============================================================================
// SEA Digital Nomad Visa Comparison Types
// Flat comparison format for the SEA comparison table.
// =============================================================================

export interface SEAComparisonColumn {
  id: string;
  displayName: string;
  dataType: 'string' | 'boolean-text';
}

export interface SEAComparisonVisa {
  country: string;
  visaName: string;
  data: Record<string, string>;
}

export interface SEAComparisonData {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  disclaimer: string;
  countries: string[];
  columns: SEAComparisonColumn[];
  visas: SEAComparisonVisa[];
  sources: { label: string; url: string }[];
}
