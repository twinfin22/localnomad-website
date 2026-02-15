"use client";

import { useState } from "react";
import type { VisaInfo } from "@/lib/visa/types";
import { cn } from "@/lib/utils";
import { Briefcase, DollarSign, Info, Lightbulb } from "lucide-react";

interface StepQualifyProps {
  visa: VisaInfo;
}

export function StepQualify({ visa }: StepQualifyProps) {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});

  const handleAnswer = (id: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const requiredReqs = visa.eligibility.filter((req) => req.required);
  const allAnswered = requiredReqs.every(
    (req) => answers[req.id] !== undefined
  );
  const allQualify = requiredReqs.every((req) => answers[req.id] === true);

  // Extract tips relevant to eligibility (salary, company size, sponsor)
  const eligibilityTips =
    visa.tips?.filter(
      (tip) =>
        tip.toLowerCase().includes("salary") ||
        tip.toLowerCase().includes("company") ||
        tip.toLowerCase().includes("sponsor") ||
        tip.toLowerCase().includes("employer") ||
        tip.toLowerCase().includes("negotiate")
    ) || [];

  return (
    <div className="space-y-6">
      {/* Intro text */}
      <p className="text-muted-foreground">{visa.description}</p>

      {/* Quick check */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Quick check
        </h4>
        <div className="space-y-3">
          {visa.eligibility.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-4 py-2"
            >
              <span className="text-muted-foreground text-sm flex-1">
                {req.label}
                {!req.required && (
                  <span className="text-muted-foreground ml-2">(optional)</span>
                )}
                {req.id === "salary" && visa.incomeRequirement && (
                  <span className="block text-xs text-muted-foreground/80 mt-0.5">
                    {visa.incomeRequirement.amount} {visa.incomeRequirement.currency}
                    {visa.incomeRequirement.notes && ` — ${visa.incomeRequirement.notes}`}
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnswer(req.id, true)}
                  className={cn(
                    "px-3 py-1 min-h-[44px] text-sm rounded-md transition-colors",
                    answers[req.id] === true
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-elevated text-muted-foreground hover:bg-surface"
                  )}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(req.id, false)}
                  className={cn(
                    "px-3 py-1 min-h-[44px] text-sm rounded-md transition-colors",
                    answers[req.id] === false
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-elevated text-muted-foreground hover:bg-surface"
                  )}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result message */}
      {allAnswered && (
        <div
          className={cn(
            "p-3 rounded-lg text-sm",
            allQualify
              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          )}
        >
          {allQualify
            ? "Your answers match the published requirements for this visa."
            : "Based on your answers, your profile may not match all published requirements. Review the criteria below or explore alternative visa types."}
        </div>
      )}

      {/* Income & Work Permission cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visa.incomeRequirement && (
          <div className="p-4 rounded-lg bg-elevated border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <p className="text-foreground font-medium">
              {visa.incomeRequirement.amount} {visa.incomeRequirement.currency}
            </p>
            {visa.incomeRequirement.notes && (
              <p className="text-muted-foreground text-sm mt-1">
                {visa.incomeRequirement.notes}
              </p>
            )}
          </div>
        )}
        <div className="p-4 rounded-lg bg-elevated border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">Work Permission</span>
          </div>
          <p className="text-foreground font-medium">
            {visa.workPermission.allowed ? "Allowed" : "Not allowed"}
          </p>
          {visa.workPermission.notes && (
            <p className="text-muted-foreground text-sm mt-1">
              {visa.workPermission.notes}
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      {eligibilityTips.length > 0 && (
        <div className="space-y-2">
          {eligibilityTips.map((tip) => (
            <div key={tip} className="flex gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          This is a preliminary check. Final eligibility is determined by Korean
          immigration authorities.
        </span>
      </div>
    </div>
  );
}
