// =============================================================================
// Arrival Checklist Type Definitions
// =============================================================================

export type VisaTier = 'tourist' | 'long-term' | 'resident';

export type ChecklistItemState = 'blocked' | 'actionable' | 'done';

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  category: 'app' | 'document' | 'money' | 'transport' | 'admin' | 'connectivity' | 'safety' | 'housing' | 'food';
  required: boolean;
  visaTier: VisaTier[];
  blockedBy?: string[];
  isGate?: boolean;
  estimatedWait?: string;
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
