import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Route,
  FileText,
} from "lucide-react";
import { PathCard } from "./path-card";
import { getDifficultyDisplay, type SimulatorPath } from "@/lib/visa/path-data";
import type { TranslationFn } from "./path-types";

export function PathViewer({
  path,
  alternativePaths,
  onSelectPath,
  onBack,
  onReset,
  buildHref,
  t,
}: {
  path: SimulatorPath;
  alternativePaths: SimulatorPath[];
  onSelectPath: (path: SimulatorPath) => void;
  onBack: () => void;
  onReset: () => void;
  buildHref: (path: string) => string;
  t: TranslationFn;
}) {
  const difficulty = getDifficultyDisplay(path.difficulty);
  const lastStep = path.steps[path.steps.length - 1];
  const targetVisaType = lastStep?.visaType;

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("chooseDifferentDest")}
      </button>

      {/* Path header */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Route className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground mb-1">
                {path.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                {path.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{path.totalDuration}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    difficulty.colorClass
                  )}
                >
                  <span className="font-medium">{difficulty.label}</span>
                </div>
                <div className="text-muted-foreground">
                  {path.steps.length} step
                  {path.steps.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Suitable for */}
          {path.suitableFor.length > 0 && (
            <div className="mt-4 pt-4 border-t border-primary/10">
              <div className="text-xs text-muted-foreground mb-2">
                {t("bestSuitedFor")}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {path.suitableFor.map((audience) => (
                  <Badge key={audience} variant="secondary" className="text-xs">
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternative paths selector */}
      {alternativePaths.length > 1 && (
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-2">
            {t("pathsAvailableLabel", { count: alternativePaths.length })}
          </div>
          <div className="flex flex-wrap gap-2">
            {alternativePaths.map((altPath) => (
              <Button
                key={altPath.id}
                variant={altPath.id === path.id ? "default" : "secondary"}
                size="sm"
                onClick={() => onSelectPath(altPath)}
              >
                {altPath.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Path steps */}
      <div className="space-y-0">
        {path.steps.map((step, index) => (
          <PathCard
            key={`${step.visaType}-${step.order}`}
            step={step}
            isFirst={index === 0}
            isLast={index === path.steps.length - 1}
            stepNumber={index + 1}
            totalSteps={path.steps.length}
            detailHref={buildHref(`/visa/${step.visaType}`)}
          />
        ))}
      </div>

      {/* CTA section */}
      <div className="mt-8 space-y-3">
        {targetVisaType && (
          <Link href={buildHref(`/visa/checklist/${targetVisaType}`)}>
            <Button className="w-full" size="cta">
              <FileText className="w-5 h-5 mr-2" />
              {t("startPath", { visa: targetVisaType.toUpperCase() })}
            </Button>
          </Link>
        )}

        {targetVisaType && (
          <Link href={buildHref(`/visa/${targetVisaType}`)}>
            <Button variant="secondary" className="w-full" size="lg">
              {t("learnMoreAbout", { visa: targetVisaType.toUpperCase() })}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}

        <Button
          variant="ghost"
          className="w-full"
          size="sm"
          onClick={onReset}
        >
          {t("startOver")}
        </Button>
      </div>
    </div>
  );
}
