import { useTranslations } from "next-intl";
import {
  Sparkles,
  Calendar,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuizDisclaimer } from "@/components/visa/LegalDisclaimer";
import { visaInfo } from "./onboarding-data";
import type { VisaMatch } from "./onboarding-types";
import type { VisaType } from "@/lib/visa/types";

interface ResultsStepProps {
  matches: VisaMatch[];
  onSelectVisa: (type: VisaType) => void;
  onBack: () => void;
  t: ReturnType<typeof useTranslations>;
}

export function ResultsStep({ matches, onSelectVisa, onBack, t }: ResultsStepProps) {
  return (
    <div className="space-y-6">
      <QuizDisclaimer className="mb-4" />
      {matches.map((match, index) => (
        <button
          key={match.type}
          onClick={() => onSelectVisa(match.type)}
          className={cn(
            "w-full bg-surface border border-border rounded-xl p-6 text-left transition-all",
            ""
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
              "bg-elevated text-muted-foreground"
            )}>
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {match.name}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">{match.tagline}</p>
            </div>
            <div className="flex items-center gap-2 text-primary font-medium">
              <span>View</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      ))}
      {/* Disclaimer */}
      <QuizDisclaimer className="mt-4" />

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>
    </div>
  );
}

interface SetupStepProps {
  selectedVisa: VisaType;
  targetDate: string;
  onTargetDateChange: (date: string) => void;
  onStartJourney: () => void;
  onBack: () => void;
  t: ReturnType<typeof useTranslations>;
}

export function SetupStep({
  selectedVisa,
  targetDate,
  onTargetDateChange,
  onStartJourney,
  onBack,
  t,
}: SetupStepProps) {
  const daysUntil = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-8">
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {visaInfo[selectedVisa].name}
            </h3>
            <p className="text-sm text-muted-foreground">{visaInfo[selectedVisa].tagline}</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground mb-2 block">
              When do you want to be in Korea?
            </span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => onTargetDateChange(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl bg-elevated border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </label>

          {daysUntil !== null && daysUntil > 0 && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    {t("onboarding.daysToPrepare", { count: daysUntil })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("onboarding.trackProgress")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={onStartJourney}
        disabled={!targetDate}
        variant="primary"
        className="w-full py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("onboarding.startMyJourney")}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t("onboarding.backToResults")}</span>
      </button>
    </div>
  );
}
