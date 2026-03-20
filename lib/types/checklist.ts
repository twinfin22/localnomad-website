// =============================================================================
// Arrival Checklist Type Definitions
// =============================================================================

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  category: 'app' | 'document' | 'money' | 'transport' | 'admin' | 'connectivity' | 'safety' | 'housing' | 'food';
  required: boolean;
  visaFilter?: string[];
  tips?: string[];
  link?: string;
  linkLabel?: string;
  warnings?: string[];
}

export interface ChecklistPhase {
  id: string;
  title: string;
  timeframe: string;
  description?: string;
  items: ChecklistItem[];
}

export interface CountryChecklist {
  country: string;
  title: string;
  lastUpdated: string;
  blogUrl: string;
  phases: ChecklistPhase[];
}
