// =============================================================================
// Dashboard Type Definitions — Phase 1-4
// Supabase Auth + Dashboard types for user profiles, visa tracking, checklists.
// =============================================================================

export interface Profile {
  id: string;
  display_name: string | null;
  preferred_locale: string | null;
  created_at: string;
  updated_at: string;
}

export type VisaCountry = 'kr' | 'tw' | 'jp' | 'cn';

export interface UserVisa {
  id: string;
  user_id: string;
  country: VisaCountry;
  goal_visa_type: string;
  current_visa_type: string | null;
  current_expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  user_visa_id: string;
  document_id: string;
  checked: boolean;
  checked_at: string | null;
}
