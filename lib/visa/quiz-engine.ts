import type {
  VisaType,
  QuizAnswers,
  VisaRecommendation,
  MatchLevel,
  VisaPathStep,
  VisaGoal,
  CurrentStatus,
} from './types';

// =============================================================================
// Scoring Configuration
// =============================================================================

interface VisaScoreConfig {
  visaType: VisaType;
  baseScore: number;
  goalMultipliers: Partial<Record<VisaGoal, number>>;
  incomeThreshold?: number; // USD annual
  requiresJobOffer?: boolean;
  requiresSponsor?: boolean;
  ageRange?: { min: number; max: number };
  educationBonus?: Partial<Record<string, number>>;
  koreanBonus?: Partial<Record<string, number>>;
}

const VISA_SCORING_CONFIG: VisaScoreConfig[] = [
  {
    visaType: 'f-1-d',
    baseScore: 50,
    goalMultipliers: {
      'remote-work': 2.0,
      'long-term-residence': 1.2,
    },
    incomeThreshold: 66000, // ~$66K USD / ₩88M (GNI × 2, 2025)
  },
  {
    visaType: 'e-7',
    baseScore: 50,
    goalMultipliers: {
      'korean-employment': 2.0,
      'long-term-residence': 1.3,
    },
    requiresJobOffer: true,
    educationBonus: {
      bachelors: 10,
      masters: 15,
      phd: 20,
    },
  },
  {
    visaType: 'd-10',
    baseScore: 40,
    goalMultipliers: {
      'korean-employment': 1.5,
      'long-term-residence': 1.2,
    },
    educationBonus: {
      bachelors: 15,
      masters: 20,
      phd: 25,
    },
  },
  {
    visaType: 'h-1',
    baseScore: 45,
    goalMultipliers: {
      'working-holiday': 2.0,
      'korean-employment': 1.2,
    },
    ageRange: { min: 18, max: 30 },
  },
  {
    visaType: 'd-2',
    baseScore: 50,
    goalMultipliers: {
      study: 2.0,
      'korean-employment': 0.8,
    },
  },
  {
    visaType: 'f-2',
    baseScore: 30,
    goalMultipliers: {
      'long-term-residence': 2.0,
      'korean-employment': 1.5,
    },
    koreanBonus: {
      'topik-3-4': 15,
      'topik-5-6': 25,
    },
    incomeThreshold: 66000, // GNI x 2 for points
  },
];

// =============================================================================
// Working Holiday Agreement Countries
// =============================================================================

const WH_AGREEMENT_COUNTRIES = [
  'au', // Australia
  'ca', // Canada
  'fr', // France
  'de', // Germany
  'hk', // Hong Kong
  'ie', // Ireland
  'jp', // Japan
  'nz', // New Zealand
  'tw', // Taiwan
  'uk', // United Kingdom
  'us', // United States
  // Add more as needed
];

// =============================================================================
// Core Quiz Engine Functions
// =============================================================================

/**
 * Calculate visa recommendations based on quiz answers
 * Returns sorted array with best matches first
 */
export function calculateRecommendations(
  answers: QuizAnswers
): VisaRecommendation[] {
  const recommendations: VisaRecommendation[] = [];

  for (const config of VISA_SCORING_CONFIG) {
    const result = scoreVisa(config, answers);
    if (result) {
      recommendations.push(result);
    }
  }

  // Sort by match level priority, then by number of match reasons
  return recommendations.sort((a, b) => {
    const levelPriority: Record<MatchLevel, number> = {
      strong: 3,
      moderate: 2,
      possible: 1,
    };
    const priorityDiff = levelPriority[b.matchLevel] - levelPriority[a.matchLevel];
    if (priorityDiff !== 0) return priorityDiff;
    return b.matchReasons.length - a.matchReasons.length;
  });
}

/**
 * Score a single visa type against user answers
 */
function scoreVisa(
  config: VisaScoreConfig,
  answers: QuizAnswers
): VisaRecommendation | null {
  let score = config.baseScore;
  const matchReasons: string[] = [];
  const warningReasons: string[] = [];

  // Goal alignment (most important factor)
  if (answers.goal && config.goalMultipliers[answers.goal]) {
    const multiplier = config.goalMultipliers[answers.goal]!;
    score *= multiplier;
    if (multiplier >= 1.5) {
      matchReasons.push(getGoalMatchReason(answers.goal, config.visaType));
    }
  } else if (answers.goal) {
    // Goal doesn't match this visa well
    score *= 0.5;
  }

  // Income requirement check
  if (config.incomeThreshold) {
    if (answers.annualIncome !== undefined) {
      if (answers.annualIncome >= config.incomeThreshold) {
        score += 25;
        matchReasons.push(
          `Meets income requirement ($${config.incomeThreshold.toLocaleString()}+/year)`
        );
      } else {
        score -= 20;
        warningReasons.push(
          `Income may be below $${config.incomeThreshold.toLocaleString()}/year threshold`
        );
      }
    }
  }

  // Job offer requirement
  if (config.requiresJobOffer) {
    if (answers.hasJobOffer === true) {
      score += 30;
      matchReasons.push('Has job offer from Korean employer');
    } else if (answers.hasJobOffer === false) {
      score -= 30;
      warningReasons.push('Requires job offer from Korean employer');
    }
  }

  // Age requirement (for H-1)
  if (config.ageRange) {
    if (answers.age !== undefined) {
      if (answers.age >= config.ageRange.min && answers.age <= config.ageRange.max) {
        score += 20;
        matchReasons.push(`Within age requirement (${config.ageRange.min}-${config.ageRange.max})`);
      } else {
        score = 0; // Disqualifying
        warningReasons.push(`Age must be ${config.ageRange.min}-${config.ageRange.max}`);
      }
    }

    // Country check for Working Holiday
    if (config.visaType === 'h-1' && answers.nationality) {
      if (WH_AGREEMENT_COUNTRIES.includes(answers.nationality.toLowerCase())) {
        score += 10;
        matchReasons.push('Country has Working Holiday agreement with Korea');
      } else {
        score = 0;
        warningReasons.push('Country may not have Working Holiday agreement');
      }
    }
  }

  // Education bonus
  if (config.educationBonus && answers.education) {
    const bonus = config.educationBonus[answers.education];
    if (bonus) {
      score += bonus;
      matchReasons.push(`Education level (${answers.education}) meets requirements`);
    }
  }

  // Korean language bonus
  if (config.koreanBonus && answers.koreanLevel) {
    const bonus = config.koreanBonus[answers.koreanLevel];
    if (bonus) {
      score += bonus;
      matchReasons.push(`Korean proficiency (${answers.koreanLevel.toUpperCase()}) adds points`);
    }
  }

  // Current status consideration
  if (answers.currentStatus === 'student' && config.visaType === 'd-10') {
    score += 15;
    matchReasons.push('Can transition from student visa to D-10');
  }

  // Skip if score is too low
  if (score <= 0) {
    return null;
  }

  // Determine match level
  const matchLevel = getMatchLevel(score);

  // Add path if applicable
  const path = getVisaPath(config.visaType, answers);

  return {
    visaType: config.visaType,
    matchLevel,
    matchReasons,
    warningReasons: warningReasons.length > 0 ? warningReasons : undefined,
    path,
  };
}

/**
 * Convert raw score to match level
 * Uses linguistic framing - NOT approval probability
 */
export function getMatchLevel(score: number): MatchLevel {
  if (score >= 80) return 'strong';
  if (score >= 50) return 'moderate';
  return 'possible';
}

/**
 * Get human-readable reason for goal match
 */
function getGoalMatchReason(goal: VisaGoal, visaType: VisaType): string {
  const reasons: Record<VisaGoal, Partial<Record<VisaType, string>>> = {
    'remote-work': {
      'f-1-d': 'Designed for remote workers employed outside Korea',
    },
    'korean-employment': {
      'e-7': 'Professional employment visa for skilled workers',
      'd-10': 'Job seeking visa for recent graduates and professionals',
    },
    study: {
      'd-2': 'Student visa for university enrollment',
    },
    'long-term-residence': {
      'f-2': 'Long-term residence visa with path to permanent residency',
    },
    business: {
      'e-7': 'Can be sponsored by your own company branch',
    },
    'working-holiday': {
      'h-1': 'Working holiday visa for eligible countries',
    },
  };

  return (
    reasons[goal]?.[visaType] || `Aligns with ${goal.replace('-', ' ')} goal`
  );
}

/**
 * Get visa path for long-term planning
 */
function getVisaPath(
  visaType: VisaType,
  answers: QuizAnswers
): VisaPathStep[] | undefined {
  // Define common paths
  const paths: Record<VisaType, VisaPathStep[]> = {
    'f-1-d': [
      {
        order: 1,
        visaType: 'f-1-d',
        visaName: 'Digital Nomad Visa',
        duration: '1-2 years',
        description: 'Work remotely while living in Korea',
      },
      {
        order: 2,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Transition to Korean employment if desired',
      },
      {
        order: 3,
        visaType: 'f-2',
        visaName: 'Long-term Residence',
        duration: '3+ years',
        description: 'Points-based residency with path to F-5',
      },
    ],
    'e-7': [
      {
        order: 1,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Work for Korean employer',
      },
      {
        order: 2,
        visaType: 'f-2',
        visaName: 'Long-term Residence',
        duration: '3+ years',
        description: 'Points-based residency',
      },
    ],
    'd-10': [
      {
        order: 1,
        visaType: 'd-10',
        visaName: 'Job Seeking Visa',
        duration: '6 months - 2 years',
        description: 'Search for employment in Korea',
      },
      {
        order: 2,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Secure full-time employment',
      },
    ],
    'h-1': [
      {
        order: 1,
        visaType: 'h-1',
        visaName: 'Working Holiday',
        duration: '1 year',
        description: 'Travel and work casually',
      },
    ],
    'd-2': [
      {
        order: 1,
        visaType: 'd-2',
        visaName: 'Student Visa',
        duration: '1-4 years',
        description: 'Complete degree program',
      },
      {
        order: 2,
        visaType: 'd-10',
        visaName: 'Job Seeking',
        duration: '6 months',
        description: 'Search for employment after graduation',
      },
    ],
    'f-2': [
      {
        order: 1,
        visaType: 'f-2',
        visaName: 'Long-term Residence',
        duration: '3+ years',
        description: 'Establish long-term residence',
      },
    ],
  };

  // Only show path if user indicated interest in long-term residence
  if (
    answers.goal === 'long-term-residence' ||
    (paths[visaType] && paths[visaType].length > 1)
  ) {
    return paths[visaType];
  }

  return undefined;
}

/**
 * Get questions that should be shown based on current answers
 */
export function getConditionalQuestions(
  goal: VisaGoal | undefined
): string[] {
  const conditionalMap: Record<VisaGoal, string[]> = {
    'remote-work': ['annualIncome', 'hasHealthInsurance'],
    'korean-employment': ['education', 'workExperience', 'hasJobOffer'],
    study: ['education'],
    'long-term-residence': ['annualIncome', 'koreanLevel', 'workExperience'],
    business: ['annualIncome'],
    'working-holiday': ['age'],
  };

  if (!goal) return [];
  return conditionalMap[goal] || [];
}

/**
 * Validate if user can proceed to next step
 */
export function canProceedToNextStep(
  currentStep: number,
  answers: QuizAnswers
): boolean {
  switch (currentStep) {
    case 1:
      return !!answers.nationality;
    case 2:
      return !!answers.currentStatus;
    case 3:
      return !!answers.goal;
    case 4:
      // Background step - at least one answer provided
      return Object.keys(answers).length > 3;
    default:
      return true;
  }
}

/**
 * Get step title for progress display
 */
export function getStepTitle(step: number): string {
  const titles = [
    'Nationality',
    'Current Status',
    'Your Goal',
    'Background',
    'Results',
  ];
  return titles[step - 1] || '';
}
