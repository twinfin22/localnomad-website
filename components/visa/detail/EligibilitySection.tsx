'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, HelpCircle, DollarSign, Briefcase } from 'lucide-react';
import type { VisaInfo } from '@/lib/visa/types';

interface EligibilitySectionProps {
  visa: VisaInfo;
  className?: string;
}

interface EligibilityAnswer {
  [key: string]: boolean | null;
}

export function EligibilitySection({
  visa,
  className,
}: EligibilitySectionProps) {
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
    <div id="eligibility" className={cn('space-y-6', className)}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Eligibility & Requirements
        </h2>
        {answeredCount > 0 && (
          <span className={cn(
            'text-sm font-medium px-3 py-1 rounded-full',
            qualifyingCount === answeredCount
              ? 'bg-blue-500/10 text-blue-400'
              : 'bg-amber-500/10 text-amber-400'
          )}>
            {qualifyingCount} of {questions.length} met
          </span>
        )}
      </div>

      {/* Quick Check Checklist */}
      <div className="p-4 rounded-xl bg-surface/30 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Quick Check
          </h3>
          <span className="text-xs text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </span>
        </div>

        <div className="space-y-2">
          {questions.map((question) => {
            const answer = answers[question.id];
            const isYes = answer === true;
            const isNo = answer === false;

            return (
              <div
                key={question.id}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  isYes && 'bg-blue-500/10 border-blue-500/30',
                  isNo && 'bg-red-500/10 border-red-500/30',
                  answer === undefined && 'bg-surface border-border/50'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                      isYes && 'bg-blue-500',
                      isNo && 'bg-red-500',
                      answer === undefined && 'border-2 border-border'
                    )}>
                      {isYes && <Check className="w-3 h-3 text-white" />}
                      {isNo && <X className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-foreground truncate">
                      {question.question}
                    </span>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleAnswer(question.id, true)}
                      className={cn(
                        'px-3 py-1.5 rounded text-xs font-medium transition-all',
                        isYes
                          ? 'bg-blue-500 text-white'
                          : 'bg-elevated text-muted-foreground hover:bg-blue-500/20 hover:text-blue-400'
                      )}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleAnswer(question.id, false)}
                      className={cn(
                        'px-3 py-1.5 rounded text-xs font-medium transition-all',
                        isNo
                          ? 'bg-red-500 text-white'
                          : 'bg-elevated text-muted-foreground hover:bg-red-500/20 hover:text-red-400'
                      )}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Result message */}
        {allAnswered && (
          <div
            className={cn(
              'p-3 rounded-lg border mt-3',
              allQualifying
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            )}
          >
            <div className="flex items-center gap-2">
              {allQualifying ? (
                <>
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">
                    Your answers align with published requirements
                  </span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-400">
                    Some requirements may not be met
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details Grid (Income + Work Permission) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Income Requirement */}
        {visa.incomeRequirement && (
          <div className="p-4 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Income</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {visa.incomeRequirement.amount} {visa.incomeRequirement.currency} / {visa.incomeRequirement.period}
            </p>
            {visa.incomeRequirement.notes && (
              <p className="text-xs text-muted-foreground mt-1">{visa.incomeRequirement.notes}</p>
            )}
          </div>
        )}

        {/* Work Permission */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Work Permission</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {visa.workPermission.allowed ? 'Work is permitted' : 'Work is not permitted'}
          </p>
          {visa.workPermission.restrictions && visa.workPermission.restrictions.length > 0 && (
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              {visa.workPermission.restrictions.slice(0, 2).map((r) => (
                <li key={r}>• {r}</li>
              ))}
              {visa.workPermission.restrictions.length > 2 && (
                <li className="text-muted-foreground">+{visa.workPermission.restrictions.length - 2} more restrictions</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground flex items-start gap-2">
        <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
        This is a preliminary check. Final eligibility is determined by Korean immigration authorities.
      </p>
    </div>
  );
}
