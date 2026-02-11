'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, HelpCircle } from 'lucide-react';
import type { VisaInfo } from '@/lib/visa/types';

interface QuickEligibilityCheckProps {
  visa: VisaInfo;
  className?: string;
}

interface EligibilityAnswer {
  [key: string]: boolean | null;
}

export function QuickEligibilityCheck({
  visa,
  className,
}: QuickEligibilityCheckProps) {
  const [answers, setAnswers] = useState<EligibilityAnswer>({});

  // Generate questions from eligibility requirements
  const questions = visa.eligibility.map((req) => ({
    id: req.id,
    question: req.label,
    helpText: req.description,
    yesIsQualifying: true,
  }));

  const handleAnswer = (questionId: string, answer: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const answeredCount = Object.values(answers).filter((a) => a !== null).length;
  const qualifyingCount = Object.entries(answers).filter(
    ([id, answer]) => {
      const question = questions.find((q) => q.id === id);
      return question && answer === question.yesIsQualifying;
    }
  ).length;

  const allAnswered = answeredCount === questions.length;
  const allQualifying = qualifyingCount === questions.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Quick Eligibility Check
        </h3>
        <span className="text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((question) => {
          const answer = answers[question.id];
          const isYes = answer === true;
          const isNo = answer === false;

          return (
            <div
              key={question.id}
              className={cn(
                'p-4 rounded-xl border transition-all',
                isYes && 'bg-blue-500/10 border-blue-500/30',
                isNo && 'bg-red-500/10 border-red-500/30',
                answer === undefined && 'bg-surface border-border'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-foreground">{question.question}</p>
                  {question.helpText && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {question.helpText}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAnswer(question.id, true)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                      isYes
                        ? 'bg-blue-500 text-white'
                        : 'bg-elevated text-muted-foreground hover:bg-blue-500/20 hover:text-blue-400'
                    )}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleAnswer(question.id, false)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                      isNo
                        ? 'bg-red-500 text-white'
                        : 'bg-elevated text-muted-foreground hover:bg-red-500/20 hover:text-red-400'
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result */}
      {allAnswered && (
        <div
          className={cn(
            'p-4 rounded-xl border mt-4',
            allQualifying
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          )}
        >
          <div className="flex items-center gap-3">
            {allQualifying ? (
              <>
                <HelpCircle className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-400">
                    Your answers match published requirements
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on your answers, your profile aligns with the published requirements
                  </p>
                </div>
              </>
            ) : (
              <>
                <HelpCircle className="w-6 h-6 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-400">
                    Some requirements may not be met
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Consider reviewing the requirements or exploring alternative visas
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground mt-4">
        This is a preliminary check based on publicly available requirements.
        Final eligibility is determined by Korean immigration authorities.
      </p>
    </div>
  );
}
