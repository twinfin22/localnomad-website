'use client';

import { cn } from '@/lib/utils';
import { Activity, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  calculateHealthScore,
  getScoreInterpretation,
  type HealthScoreFactors,
} from '@/lib/visa/health-score';

interface HealthScoreCardProps {
  factors: HealthScoreFactors;
  className?: string;
}

export function HealthScoreCard({ factors, className }: HealthScoreCardProps) {
  const score = calculateHealthScore(factors);
  const interpretation = getScoreInterpretation(score);

  // Calculate the stroke dasharray for the circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreIcon = () => {
    if (score >= 80) return CheckCircle2;
    if (score >= 60) return TrendingUp;
    if (score >= 40) return Activity;
    return AlertTriangle;
  };

  const ScoreIcon = getScoreIcon();

  return (
    <div className={cn('vk-card p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Preparation Score
        </h3>
        <ScoreIcon className={cn('w-5 h-5', interpretation.color)} />
      </div>

      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn(
                'transition-all duration-500',
                score >= 80 && 'text-emerald-400',
                score >= 60 && score < 80 && 'text-cyan-400',
                score >= 40 && score < 60 && 'text-amber-400',
                score < 40 && 'text-red-400'
              )}
              style={{
                strokeDasharray,
                strokeDashoffset,
              }}
            />
          </svg>
          {/* Score text in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="flex-1 space-y-3">
          <div>
            <span className={cn('text-lg font-semibold', interpretation.color)}>
              {interpretation.label}
            </span>
            <p className="text-sm text-slate-400 mt-1">
              {interpretation.message}
            </p>
          </div>

          {/* Factor breakdown */}
          <div className="space-y-2 pt-2">
            <ScoreFactor
              label="Documents"
              value={factors.documentsCompleted}
              total={factors.documentsTotal}
              weight="50%"
            />
            <ScoreFactor
              label="Timeline"
              value={factors.daysUntilTarget ?? 0}
              isTimeline
              weight="25%"
            />
            <ScoreFactor
              label="Insurance"
              value={factors.insuranceValid ? 1 : 0}
              total={1}
              weight="15%"
            />
          </div>
        </div>
      </div>

      {/* Legal disclaimer */}
      <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800">
        This score reflects your document preparation progress, not approval likelihood.
      </p>
    </div>
  );
}

interface ScoreFactorProps {
  label: string;
  value: number;
  total?: number;
  isTimeline?: boolean;
  weight: string;
}

function ScoreFactor({ label, value, total, isTimeline, weight }: ScoreFactorProps) {
  const percentage = isTimeline
    ? Math.min(100, Math.max(0, value > 30 ? 100 : (value / 30) * 100))
    : total
    ? (value / total) * 100
    : 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            percentage >= 80 && 'bg-emerald-500',
            percentage >= 50 && percentage < 80 && 'bg-cyan-500',
            percentage < 50 && 'bg-amber-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-slate-600 w-8">{weight}</span>
    </div>
  );
}
