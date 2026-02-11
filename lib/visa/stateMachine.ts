// =============================================================================
// Visa State Machine - Types & Utilities
// =============================================================================

import type { VisaType } from "./types";

/**
 * Visa lifecycle states
 */
export type VisaState =
  | "NO_VISA"       // No visa - starting point
  | "PREPARING"     // Preparing documents
  | "SUBMITTED"     // Application submitted
  | "UNDER_REVIEW"  // Under review by immigration
  | "APPROVED"      // Visa approved
  | "ACTIVE"        // Currently valid and in use
  | "EXPIRING"      // Expiring within 30 days
  | "EXPIRED";      // Visa expired

/**
 * State metadata for display
 */
export interface StateInfo {
  id: VisaState;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}

/**
 * State machine configuration
 */
export const stateConfig: Record<VisaState, StateInfo> = {
  NO_VISA: {
    id: "NO_VISA",
    label: "No Visa",
    description: "Start your visa journey",
    color: "#94A3B8",
    bgColor: "rgba(148, 163, 184, 0.1)",
    icon: "Circle",
  },
  PREPARING: {
    id: "PREPARING",
    label: "Preparing",
    description: "Collecting documents",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
    icon: "FileText",
  },
  SUBMITTED: {
    id: "SUBMITTED",
    label: "Submitted",
    description: "Application submitted",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    icon: "Send",
  },
  UNDER_REVIEW: {
    id: "UNDER_REVIEW",
    label: "Under Review",
    description: "Being reviewed",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.1)",
    icon: "Clock",
  },
  APPROVED: {
    id: "APPROVED",
    label: "Approved",
    description: "Visa approved",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    icon: "CheckCircle",
  },
  ACTIVE: {
    id: "ACTIVE",
    label: "Active",
    description: "Currently valid",
    color: "#22D3EE",
    bgColor: "rgba(34, 211, 238, 0.1)",
    icon: "Shield",
  },
  EXPIRING: {
    id: "EXPIRING",
    label: "Expiring Soon",
    description: "Renew within 30 days",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
    icon: "AlertTriangle",
  },
  EXPIRED: {
    id: "EXPIRED",
    label: "Expired",
    description: "Visa has expired",
    color: "#6B7280",
    bgColor: "rgba(107, 114, 128, 0.1)",
    icon: "XCircle",
  },
};

/**
 * State order for timeline display
 */
export const stateOrder: VisaState[] = [
  "NO_VISA",
  "PREPARING",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVE",
  "EXPIRING",
  "EXPIRED",
];

/**
 * Valid state transitions
 */
export const validTransitions: Record<VisaState, VisaState[]> = {
  NO_VISA: ["PREPARING"],
  PREPARING: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "PREPARING"], // Can be rejected and need to reapply
  APPROVED: ["ACTIVE"],
  ACTIVE: ["EXPIRING", "EXPIRED"],
  EXPIRING: ["ACTIVE", "EXPIRED"], // Can renew or expire
  EXPIRED: ["PREPARING"], // Start over
};

// =============================================================================
// User Progress Types
// =============================================================================

/**
 * User's visa progress data
 */
export interface VisaProgress {
  id: string;
  visaType: VisaType;
  state: VisaState;
  targetDate?: Date;
  submittedDate?: Date;
  approvedDate?: Date;
  entryDate?: Date;
  expiryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Action item for next steps
 */
export interface NextAction {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  deadline?: Date;
  link?: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get state info by state ID
 */
export function getStateInfo(state: VisaState): StateInfo {
  return stateConfig[state];
}

/**
 * Check if a transition is valid
 */
export function canTransition(from: VisaState, to: VisaState): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Get the next possible states from current state
 */
export function getNextStates(current: VisaState): VisaState[] {
  return validTransitions[current] || [];
}

/**
 * Get the index of a state in the timeline
 */
export function getStateIndex(state: VisaState): number {
  return stateOrder.indexOf(state);
}

/**
 * Get the progress percentage through the visa journey
 * (Excluding EXPIRING and EXPIRED as they're post-active states)
 */
export function getProgressPercentage(state: VisaState): number {
  const activeStates: VisaState[] = [
    "NO_VISA",
    "PREPARING",
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "ACTIVE",
  ];
  const index = activeStates.indexOf(state);
  if (index === -1) return 100; // EXPIRING or EXPIRED
  return Math.round((index / (activeStates.length - 1)) * 100);
}

/**
 * Calculate days until target/expiry date
 */
export function getDaysUntil(date: Date | undefined): number | null {
  if (!date) return null;
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format days remaining for display
 */
export function formatDaysRemaining(days: number | null): string {
  if (days === null) return "No deadline set";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

/**
 * Get urgency level based on days remaining
 */
export function getUrgency(days: number | null): "critical" | "warning" | "normal" | "none" {
  if (days === null) return "none";
  if (days <= 0) return "critical";
  if (days <= 7) return "critical";
  if (days <= 30) return "warning";
  return "normal";
}

/**
 * Get next actions based on current state
 */
export function getNextActions(state: VisaState, visaType: VisaType): NextAction[] {
  const actions: NextAction[] = [];

  switch (state) {
    case "NO_VISA":
      actions.push({
        id: "start-quiz",
        title: "Check Your Eligibility",
        description: "Take the eligibility quiz to find the right visa for you",
        priority: "high",
        link: "/visa/quiz",
      });
      break;

    case "PREPARING":
      actions.push({
        id: "complete-checklist",
        title: "Complete Document Checklist",
        description: "Gather all required documents for your application",
        priority: "high",
        link: "/visa/checklist",
      });
      actions.push({
        id: "book-appointment",
        title: "Book Immigration Appointment",
        description: "Schedule your visa application appointment",
        priority: "medium",
        link: "https://www.hikorea.go.kr",
      });
      break;

    case "SUBMITTED":
      actions.push({
        id: "track-status",
        title: "Track Application Status",
        description: "Check your application status on HiKorea",
        priority: "high",
        link: "https://www.hikorea.go.kr",
      });
      break;

    case "UNDER_REVIEW":
      actions.push({
        id: "wait",
        title: "Application Under Review",
        description: "Immigration is reviewing your application. You'll be notified of the result.",
        priority: "low",
      });
      break;

    case "APPROVED":
      actions.push({
        id: "pick-up",
        title: "Pick Up Your Visa",
        description: "Collect your visa from the embassy or immigration office",
        priority: "high",
      });
      break;

    case "ACTIVE":
      actions.push({
        id: "arc-check",
        title: "Verify ARC Registration",
        description: "Ensure your Alien Registration Card is up to date",
        priority: "medium",
      });
      break;

    case "EXPIRING":
      actions.push({
        id: "renew",
        title: "Renew Your Visa",
        description: "Start the visa extension process before it expires",
        priority: "high",
        link: "/visa/checklist",
      });
      break;

    case "EXPIRED":
      actions.push({
        id: "restart",
        title: "Start New Application",
        description: "Your visa has expired. Begin a new application process.",
        priority: "high",
        link: "/visa/quiz",
      });
      break;
  }

  return actions;
}

/**
 * Get state-specific tips/warnings
 */
export function getStateTips(state: VisaState): string[] {
  switch (state) {
    case "PREPARING":
      return [
        "Make sure all documents are translated to Korean or English",
        "Apostille may be required for foreign documents",
        "Keep original documents safe - you'll need them at the interview",
      ];
    case "SUBMITTED":
      return [
        "Processing usually takes 2-4 weeks",
        "You may be contacted for additional documents",
        "Don't make travel plans until approved",
      ];
    case "EXPIRING":
      return [
        "Start renewal process at least 2 months before expiry",
        "You cannot renew after expiration",
        "Prepare updated documents for extension",
      ];
    default:
      return [];
  }
}

// =============================================================================
// Local Storage Helpers
// =============================================================================

const STORAGE_KEY = "visa-progress";

/**
 * Get user's visa progress from localStorage
 */
export function getStoredProgress(): VisaProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    return {
      ...data,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      submittedDate: data.submittedDate ? new Date(data.submittedDate) : undefined,
      approvedDate: data.approvedDate ? new Date(data.approvedDate) : undefined,
      entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  } catch {
    return null;
  }
}

/**
 * Save user's visa progress to localStorage
 */
export function saveProgress(progress: VisaProgress): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    console.error("Failed to save visa progress");
  }
}

/**
 * Clear stored progress
 */
export function clearProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Create a new progress record
 */
export function createProgress(visaType: VisaType): VisaProgress {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    visaType,
    state: "PREPARING",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update progress state
 */
export function updateProgressState(
  progress: VisaProgress,
  newState: VisaState
): VisaProgress {
  if (!canTransition(progress.state, newState)) {
    console.warn(`Invalid transition from ${progress.state} to ${newState}`);
    return progress;
  }

  const updated = {
    ...progress,
    state: newState,
    updatedAt: new Date(),
  };

  // Auto-set dates based on state
  if (newState === "SUBMITTED" && !updated.submittedDate) {
    updated.submittedDate = new Date();
  }
  if (newState === "APPROVED" && !updated.approvedDate) {
    updated.approvedDate = new Date();
  }
  if (newState === "ACTIVE" && !updated.entryDate) {
    updated.entryDate = new Date();
  }

  return updated;
}
