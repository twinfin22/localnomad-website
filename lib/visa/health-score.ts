import type {
  VisaState,
  HealthScoreFactors,
  HealthScoreInterpretation,
} from './types';

// Re-export types for consumers
export type { HealthScoreFactors, HealthScoreInterpretation };

// =============================================================================
// Health Score Calculator
// =============================================================================

/**
 * Calculate Preparation Progress Score (0-100)
 *
 * IMPORTANT: This score measures PREPARATION READINESS, not approval likelihood.
 * It indicates how well-prepared a user is for their visa journey.
 *
 * Weights:
 * - Document completion: 50%
 * - Timeline adherence: 25%
 * - Insurance validity: 15%
 * - Overall progress state: 10%
 */
export function calculateHealthScore(factors: HealthScoreFactors): number {
  let score = 0;

  // Document completion (50 points max)
  if (factors.documentsTotal > 0) {
    const docScore =
      (factors.documentsCompleted / factors.documentsTotal) * 50;
    score += docScore;
  }

  // Timeline adherence (25 points max)
  // More points for having more time, fewer if rushing
  if (factors.daysUntilTarget !== null) {
    if (factors.daysUntilTarget >= 60) {
      score += 25;
    } else if (factors.daysUntilTarget >= 30) {
      score += 20;
    } else if (factors.daysUntilTarget >= 14) {
      score += 15;
    } else if (factors.daysUntilTarget >= 7) {
      score += 10;
    } else if (factors.daysUntilTarget >= 0) {
      score += 5;
    }
    // Overdue = 0 points
  } else {
    // No target date set - give partial credit
    score += 10;
  }

  // Insurance validity (15 points max)
  if (factors.insuranceValid) {
    if (
      factors.insuranceExpiresInDays === null ||
      factors.insuranceExpiresInDays > 90
    ) {
      score += 15;
    } else if (factors.insuranceExpiresInDays > 30) {
      score += 10;
    } else if (factors.insuranceExpiresInDays > 7) {
      score += 5;
    }
    // Expires in < 7 days or expired = 0 points
  }

  // State progress (10 points max)
  const stateScores: Record<VisaState, number> = {
    NO_VISA: 0,
    PREPARING: 2,
    SUBMITTED: 5,
    UNDER_REVIEW: 7,
    APPROVED: 10,
    ACTIVE: 10,
    EXPIRING: 5,
    EXPIRED: 0,
  };
  score += stateScores[factors.state] || 0;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Get score interpretation for display
 */
export function getScoreInterpretation(
  score: number
): HealthScoreInterpretation {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: 'emerald',
      message: 'Your preparation is on track!',
    };
  }
  if (score >= 60) {
    return {
      label: 'Good',
      color: 'cyan',
      message: 'A few items need attention.',
    };
  }
  if (score >= 40) {
    return {
      label: 'Needs Work',
      color: 'amber',
      message: 'Focus on completing your checklist.',
    };
  }
  if (score >= 20) {
    return {
      label: 'Getting Started',
      color: 'slate',
      message: 'Start gathering your documents.',
    };
  }
  return {
    label: 'Not Started',
    color: 'red',
    message: 'Begin your visa preparation journey.',
  };
}

/**
 * Get color class for health score display
 */
export function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-cyan-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-slate-400';
}

/**
 * Get background color class for health score card
 */
export function getScoreBgClass(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10';
  if (score >= 60) return 'bg-cyan-500/10';
  if (score >= 40) return 'bg-amber-500/10';
  return 'bg-slate-500/10';
}

/**
 * Calculate days until a date
 */
export function getDaysUntil(date: Date | string | null): number | null {
  if (!date) return null;
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get urgency level based on days remaining
 */
export function getUrgencyLevel(
  daysRemaining: number | null
): 'low' | 'medium' | 'high' | 'critical' {
  if (daysRemaining === null) return 'low';
  if (daysRemaining <= 0) return 'critical';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'high';
  if (daysRemaining <= 60) return 'medium';
  return 'low';
}

/**
 * Get urgency color class
 */
export function getUrgencyColorClass(
  urgency: 'low' | 'medium' | 'high' | 'critical'
): string {
  switch (urgency) {
    case 'critical':
      return 'text-red-500 bg-red-500/10';
    case 'high':
      return 'text-amber-500 bg-amber-500/10';
    case 'medium':
      return 'text-cyan-500 bg-cyan-500/10';
    default:
      return 'text-slate-400 bg-slate-500/10';
  }
}

/**
 * Format days remaining for display
 */
export function formatDaysRemaining(days: number | null): string {
  if (days === null) return 'No date set';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}
