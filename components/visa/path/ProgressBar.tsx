import { cn } from "@/lib/utils";
import type { SimulatorStep, TranslationFn } from "./path-types";

export function ProgressBar({ currentStep, t }: { currentStep: SimulatorStep; t: TranslationFn }) {
  const steps = [
    { key: "select-start", label: t("stepYourVisa") },
    { key: "select-destination", label: t("stepDestination") },
    { key: "view-path", label: t("stepPath") },
  ] as const;

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive &&
                    "bg-primary/20 text-primary ring-2 ring-primary/40",
                  !isCompleted &&
                    !isActive &&
                    "bg-elevated text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:inline",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 min-w-4",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
