'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Check,
  AlertTriangle,
  RefreshCw,
  Bookmark,
} from 'lucide-react';
import { parseLocalePath, buildLocalePath } from '@/lib/i18n/config';
import type { VisaRecommendation, MatchLevel } from '@/lib/visa/types';
import { VisaPathInline } from './VisaPathMap';
import { QuizDisclaimer } from '@/components/visa/LegalDisclaimer';

interface QuizResultsProps {
  recommendations: VisaRecommendation[];
  onRetakeQuiz: () => void;
  onSaveResults?: () => void;
}

const MATCH_LEVEL_CONFIG: Record<
  MatchLevel,
  { label: string; color: string; bgColor: string; description: string }
> = {
  strong: {
    label: 'Strong Match',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    description: 'Appears to meet published requirements',
  },
  moderate: {
    label: 'Moderate Match',
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/30',
    description: 'May meet requirements with some conditions',
  },
  possible: {
    label: 'Possible Option',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    description: 'Worth exploring, but may not be ideal',
  },
};

const VISA_NAMES: Record<string, string> = {
  'f-1-d': 'Digital Nomad Visa',
  'e-7': 'Professional Employment Visa',
  'd-10': 'Job Seeking Visa',
  'h-1': 'Working Holiday Visa',
  'd-2': 'Student Visa',
  'f-2': 'Long-term Residence Visa',
};

export function QuizResults({
  recommendations,
  onRetakeQuiz,
  onSaveResults,
}: QuizResultsProps) {
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const localePath = (path: string) =>
    buildLocalePath(path, locale, country ?? undefined);
  const topRecommendation = recommendations[0];
  const otherRecommendations = recommendations.slice(1, 4);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Your Visa Recommendations
        </h2>
        <p className="text-muted-foreground text-lg">
          Based on your answers, here are the visas that may fit your situation
        </p>
      </div>

      {/* Top Recommendation */}
      {topRecommendation && (
        <div className="mb-6">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Closest Match
          </div>
          <RecommendationCard
            recommendation={topRecommendation}
            isTopPick
            localePath={localePath}
          />
        </div>
      )}

      {/* Other Recommendations */}
      {otherRecommendations.length > 0 && (
        <div className="mb-8">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Other Options
          </div>
          <div className="grid gap-3">
            {otherRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.visaType}
                recommendation={rec}
                localePath={localePath}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
        {topRecommendation && (
          <Link href={localePath(`/visa/${topRecommendation.visaType}`)}>
            <Button
              size="lg"
              className="bg-primary hover:bg-accent-hover text-background font-medium px-6 w-full sm:w-auto"
            >
              Start Preparing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}

        {onSaveResults && (
          <Button
            size="lg"
            variant="outline"
            onClick={onSaveResults}
            className="border-border text-muted-foreground hover:bg-surface w-full sm:w-auto"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Save Results
          </Button>
        )}

        <Button
          size="lg"
          variant="ghost"
          onClick={onRetakeQuiz}
          className="text-muted-foreground hover:text-foreground hover:bg-surface w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
      </div>

      {/* Disclaimer */}
      <QuizDisclaimer />
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: VisaRecommendation;
  isTopPick?: boolean;
  localePath: (path: string) => string;
}

function RecommendationCard({
  recommendation,
  isTopPick = false,
  localePath,
}: RecommendationCardProps) {
  const config = MATCH_LEVEL_CONFIG[recommendation.matchLevel];
  const visaName = VISA_NAMES[recommendation.visaType] || recommendation.visaType;

  return (
    <div
      className={cn(
        'p-5 rounded-xl border transition-all',
        isTopPick ? config.bgColor : 'bg-surface border-border',
        'hover:border-border'
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Visa info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-foreground uppercase">
              {recommendation.visaType}
            </span>
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                config.bgColor,
                config.color
              )}
            >
              {config.label}
            </span>
          </div>
          <div className="text-muted-foreground">{visaName}</div>
        </div>

        {/* View button */}
        <Link href={localePath(`/visa/${recommendation.visaType}`)}>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            View
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Match reasons */}
      {recommendation.matchReasons.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {recommendation.matchReasons.slice(0, 3).map((reason, index) => (
            <div key={`match-${index}`} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warning reasons */}
      {recommendation.warningReasons && recommendation.warningReasons.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {recommendation.warningReasons.slice(0, 2).map((reason, index) => (
            <div key={`warning-${index}`} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Visa path */}
      {recommendation.path && recommendation.path.length > 1 && (
        <div className="pt-3 border-t border-border/50">
          <VisaPathInline path={recommendation.path} />
        </div>
      )}
    </div>
  );
}
