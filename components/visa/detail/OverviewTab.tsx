import {
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/animated-section";
import type { VisaInfo } from "@/lib/visa/types";

interface OverviewTabProps {
  visa: VisaInfo;
}

export function OverviewTab({ visa }: OverviewTabProps) {
  return (
    <AnimatedSection>
      <div className="space-y-12">
        {/* Target Audience */}
        <div>
          <h2 className="text-2xl font-bold  mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Who Is This Visa For?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visa.targetAudience.map((target, i) => (
              <div
                key={`target-${i}`}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
              >
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <span>{target}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div>
          <h2 className="text-2xl font-bold  mb-4">
            Eligibility Requirements
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6">
            <ul className="space-y-4">
              {visa.eligibility.map((req) => (
                <li key={req.id} className="flex items-start gap-3">
                  {req.required ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span
                      className={cn(
                        "font-medium",
                        !req.required && "text-muted-foreground"
                      )}
                    >
                      {req.label}
                    </span>
                    {req.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {req.description}
                      </p>
                    )}
                    {!req.required && (
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Income Requirement */}
        {visa.incomeRequirement && (
          <div>
            <h2 className="text-2xl font-bold  mb-4">
              Income Requirement
            </h2>
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-accent">
                  {visa.incomeRequirement.currency === "USD"
                    ? "$"
                    : "₩"}
                  {visa.incomeRequirement.amount}
                </span>
                <span className="text-muted-foreground">
                  / {visa.incomeRequirement.period}
                </span>
              </div>
              {visa.incomeRequirement.notes && (
                <p className="text-sm text-muted-foreground">
                  {visa.incomeRequirement.notes}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Work Permission Details */}
        {visa.workPermission.restrictions &&
          visa.workPermission.restrictions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold  mb-4">
                Work Permission Details
              </h2>
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  {visa.workPermission.allowed ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        Work is allowed with restrictions
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        Work is not allowed
                      </span>
                    </>
                  )}
                </div>
                <ul className="space-y-2">
                  {visa.workPermission.restrictions.map(
                    (restriction, i) => (
                      <li
                        key={`restriction-${i}`}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        {restriction}
                      </li>
                    )
                  )}
                </ul>
                {visa.workPermission.notes && (
                  <p className="mt-4 text-sm text-muted-foreground italic">
                    {visa.workPermission.notes}
                  </p>
                )}
              </div>
            </div>
          )}

        {/* Tips & Warnings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tips */}
          <div>
            <h2 className="text-xl font-bold  mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              Tips
            </h2>
            <div className="bg-card border border-border rounded-2xl p-6">
              <ul className="space-y-3">
                {visa.tips.map((tip, i) => (
                  <li
                    key={`tip-${i}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warnings */}
          {visa.warnings && visa.warnings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold  mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Warnings
              </h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <ul className="space-y-3">
                  {visa.warnings.map((warning, i) => (
                    <li
                      key={`warning-${i}`}
                      className="flex items-start gap-2 text-sm"
                    >
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {warning}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}
