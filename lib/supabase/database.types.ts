export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          nationality: string | null;
          stated_income: number | null;
          days_in_korea: number;
          arrival_date: string | null;
          preferred_locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nationality?: string | null;
          stated_income?: number | null;
          days_in_korea?: number;
          arrival_date?: string | null;
          preferred_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nationality?: string | null;
          stated_income?: number | null;
          days_in_korea?: number;
          arrival_date?: string | null;
          preferred_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      visa_progress: {
        Row: {
          id: string;
          user_id: string;
          visa_type: string;
          state: string;
          target_date: string | null;
          submitted_date: string | null;
          approved_date: string | null;
          entry_date: string | null;
          expiry_date: string | null;
          notes: string | null;
          health_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          visa_type: string;
          state?: string;
          target_date?: string | null;
          submitted_date?: string | null;
          approved_date?: string | null;
          entry_date?: string | null;
          expiry_date?: string | null;
          notes?: string | null;
          health_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          visa_type?: string;
          state?: string;
          target_date?: string | null;
          submitted_date?: string | null;
          approved_date?: string | null;
          entry_date?: string | null;
          expiry_date?: string | null;
          notes?: string | null;
          health_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      checklist_items: {
        Row: {
          id: string;
          user_id: string;
          visa_type: string;
          document_id: string;
          completed: boolean;
          completed_at: string | null;
          expires_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          visa_type: string;
          document_id: string;
          completed?: boolean;
          completed_at?: string | null;
          expires_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          visa_type?: string;
          document_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          expires_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      deadlines: {
        Row: {
          id: string;
          user_id: string;
          visa_type: string | null;
          deadline_type: string;
          title: string;
          deadline_date: string;
          reminder_days: number[];
          is_recurring: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          visa_type?: string | null;
          deadline_type: string;
          title: string;
          deadline_date: string;
          reminder_days?: number[];
          is_recurring?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          visa_type?: string | null;
          deadline_type?: string;
          title?: string;
          deadline_date?: string;
          reminder_days?: number[];
          is_recurring?: boolean;
          created_at?: string;
        };
      };
      day_tracker: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          exit_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          exit_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          exit_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
