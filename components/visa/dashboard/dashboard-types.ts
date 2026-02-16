import type { VisaType, VisaState } from '@/lib/visa/types';

export interface DashboardData {
  visaType: VisaType;
  state: VisaState;
  targetDate?: string;
  submittedDate?: string;
  approvedDate?: string;
  entryDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface ChecklistItem {
  documentId: string;
  completed: boolean;
}
