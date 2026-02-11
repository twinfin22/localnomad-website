"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Route,
  Sparkles,
  Target,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { PathCard } from "./path-card";
import {
  STARTING_POINTS,
  getDestinationsFromPaths,
  getPathsToDestination,
  getDifficultyDisplay,
  VISA_DISPLAY_INFO,
  type SimulatorPath,
} from "@/lib/visa/path-data";
import type { VisaType } from "@/lib/visa/types";

// =============================================================================
// Types
// =============================================================================

type SimulatorStep = "select-start" | "select-destination" | "view-path";

// =============================================================================
// URL State Helpers
// =============================================================================

const VALID_STARTING_IDS = new Set(STARTING_POINTS.map((sp) => sp.id));

function isValidStartId(value: string): value is VisaType | "none" {
  return VALID_STARTING_IDS.has(value);
}

function isValidVisaType(value: string): value is VisaType {
  return value in VISA_DISPLAY_INFO && value !== "none";
}

// =============================================================================
// Main Component
// =============================================================================

interface VisaPathSimulatorProps {
  lang: string;
  country: string;
  initialFrom?: string | null;
  initialTo?: string | null;
}

export function VisaPathSimulator({
  lang,
  country,
  initialFrom,
  initialTo,
}: VisaPathSimulatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("pathSimulator");

  const [currentStep, setCurrentStep] =
    useState<SimulatorStep>("select-start");
  const [selectedStart, setSelectedStart] = useState<
    VisaType | "none" | null
  >(null);
  const [selectedDestination, setSelectedDestination] =
    useState<VisaType | null>(null);
  const [selectedPath, setSelectedPath] = useState<SimulatorPath | null>(
    null
  );

  // Build locale-aware paths
  const buildHref = useCallback(
    (path: string) => {
      if (lang === "en") {
        return `/${country}${path}`;
      }
      return `/${lang}/${country}${path}`;
    },
    [lang, country]
  );

  // Update URL query params without full navigation
  const updateUrlParams = useCallback(
    (from: string | null, to: string | null) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (from) {
        params.set("from", from);
      } else {
        params.delete("from");
      }
      if (to) {
        params.set("to", to);
      } else {
        params.delete("to");
      }
      const qs = params.toString();
      const basePath = buildHref("/visa/path");
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [router, searchParams, buildHref]
  );

  // Initialize from URL params on mount
  useEffect(() => {
    const from = initialFrom;
    const to = initialTo;

    if (from && isValidStartId(from)) {
      setSelectedStart(from);

      if (to && isValidVisaType(to)) {
        const paths = getPathsToDestination(from, to);
        if (paths.length > 0 && paths[0]) {
          setSelectedDestination(to);
          setSelectedPath(paths[0]);
          setCurrentStep("view-path");
          return;
        }
      }

      setCurrentStep("select-destination");
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleStartSelect = useCallback(
    (value: string) => {
      const startType = value === "none" ? "none" : (value as VisaType);
      setSelectedStart(startType);
      setSelectedDestination(null);
      setSelectedPath(null);
      setCurrentStep("select-destination");
      updateUrlParams(startType, null);
    },
    [updateUrlParams]
  );

  const handleDestinationSelect = useCallback(
    (visaType: VisaType) => {
      if (!selectedStart) return;
      setSelectedDestination(visaType);

      const paths = getPathsToDestination(selectedStart, visaType);
      if (paths.length >= 1 && paths[0]) {
        setSelectedPath(paths[0]);
        setCurrentStep("view-path");
      }
      updateUrlParams(selectedStart, visaType);
    },
    [selectedStart, updateUrlParams]
  );

  const handlePathSelect = useCallback((path: SimulatorPath) => {
    setSelectedPath(path);
  }, []);

  const handleBack = useCallback(() => {
    if (currentStep === "view-path") {
      setSelectedPath(null);
      setSelectedDestination(null);
      setCurrentStep("select-destination");
      updateUrlParams(selectedStart, null);
    } else if (currentStep === "select-destination") {
      setSelectedStart(null);
      setCurrentStep("select-start");
      updateUrlParams(null, null);
    }
  }, [currentStep, selectedStart, updateUrlParams]);

  const handleReset = useCallback(() => {
    setSelectedStart(null);
    setSelectedDestination(null);
    setSelectedPath(null);
    setCurrentStep("select-start");
    updateUrlParams(null, null);
  }, [updateUrlParams]);

  // Data
  const destinations = selectedStart
    ? getDestinationsFromPaths(selectedStart)
    : [];
  const alternativePaths =
    selectedStart && selectedDestination
      ? getPathsToDestination(selectedStart, selectedDestination)
      : [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Disclaimer — always visible at top */}
      <div className="mb-8 p-4 bg-surface border border-border rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.rich("disclaimer", {
              link: (chunks) => (
                <a
                  href="https://www.immigration.go.kr/immigration_eng/index.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-accent-hover"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <ProgressBar currentStep={currentStep} t={t} />

      {/* Step 1: Select starting visa */}
      {currentStep === "select-start" && (
        <StartingPointSelector onSelect={handleStartSelect} t={t} />
      )}

      {/* Step 2: Select destination */}
      {currentStep === "select-destination" && selectedStart && (
        <DestinationSelector
          selectedStart={selectedStart}
          destinations={destinations}
          onSelect={handleDestinationSelect}
          onBack={handleBack}
          t={t}
        />
      )}

      {/* Step 3: View full path */}
      {currentStep === "view-path" && selectedPath && selectedStart && (
        <PathViewer
          path={selectedPath}
          alternativePaths={alternativePaths}
          onSelectPath={handlePathSelect}
          onBack={handleBack}
          onReset={handleReset}
          buildHref={buildHref}
          t={t}
        />
      )}
    </div>
  );
}

// =============================================================================
// Progress Bar
// =============================================================================

type TranslationFn = ReturnType<typeof useTranslations>;

function ProgressBar({ currentStep, t }: { currentStep: SimulatorStep; t: TranslationFn }) {
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

// =============================================================================
// Step 1: Starting Point Selector
// =============================================================================

function StartingPointSelector({
  onSelect,
  t,
}: {
  onSelect: (value: string) => void;
  t: TranslationFn;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Route className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("currentVisaTitle")}
        </h2>
        <p className="text-muted-foreground">
          {t("currentVisaDesc")}
        </p>
      </div>

      {/* Mobile: Select dropdown */}
      <div className="sm:hidden mb-4">
        <Select onValueChange={onSelect}>
          <SelectTrigger className="w-full h-12 bg-surface border-border text-foreground">
            <SelectValue placeholder={t("selectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {STARTING_POINTS.map((sp) => (
              <SelectItem key={sp.id} value={sp.id}>
                {sp.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Card grid */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-3">
        {STARTING_POINTS.map((sp) => (
          <Card
            key={sp.id}
            className={cn(
              "cursor-pointer transition-all duration-200",
              "hover:border-primary/40 hover:bg-elevated"
            )}
            onClick={() => onSelect(sp.id === "none" ? "none" : sp.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="font-mono font-bold uppercase text-primary border-primary/30 flex-shrink-0"
                >
                  {sp.visaType === "none" ? "N/A" : sp.visaType}
                </Badge>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {sp.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {sp.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Step 2: Destination Selector
// =============================================================================

function DestinationSelector({
  selectedStart,
  destinations,
  onSelect,
  onBack,
  t,
}: {
  selectedStart: VisaType | "none";
  destinations: { visaType: VisaType; visaName: string; pathCount: number }[];
  onSelect: (visaType: VisaType) => void;
  onBack: () => void;
  t: TranslationFn;
}) {
  const startInfo = VISA_DISPLAY_INFO[selectedStart];

  return (
    <div>
      {/* Back button and context */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("changeStartingVisa")}
      </button>

      {/* Current visa context */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {t("startingFrom")}
              </div>
              <div className="font-semibold text-foreground">
                {selectedStart === "none"
                  ? t("noVisaTourist")
                  : `${selectedStart.toUpperCase()} - ${startInfo.name}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t("destinationTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {destinations.length > 0
            ? `${destinations.length} visa destination${destinations.length !== 1 ? "s" : ""} reachable from your current status`
            : t("noPathsYet")}
        </p>
      </div>

      {destinations.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {t("noPathsDesc")}
          </p>
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("tryDifferent")}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {destinations.map((dest) => {
            const info = VISA_DISPLAY_INFO[dest.visaType];
            return (
              <Card
                key={dest.visaType}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  "hover:border-primary/40 hover:bg-elevated"
                )}
                onClick={() => onSelect(dest.visaType)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="font-mono font-bold uppercase text-primary border-primary/30"
                          >
                            {dest.visaType}
                          </Badge>
                          <span className="font-semibold text-sm text-foreground">
                            {dest.visaName}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {info.shortDescription}
                          {dest.pathCount > 1 && (
                            <span className="ml-2 text-primary">
                              {t("pathsAvailable", { count: dest.pathCount })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Step 3: Path Viewer
// =============================================================================

function PathViewer({
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
        {/* Primary CTA: Start this path */}
        {targetVisaType && (
          <Link href={buildHref(`/visa/checklist/${targetVisaType}`)}>
            <Button className="w-full" size="cta">
              <FileText className="w-5 h-5 mr-2" />
              {t("startPath", { visa: targetVisaType.toUpperCase() })}
            </Button>
          </Link>
        )}

        {/* Secondary CTA: Learn more about target visa */}
        {targetVisaType && (
          <Link href={buildHref(`/visa/${targetVisaType}`)}>
            <Button variant="secondary" className="w-full" size="lg">
              {t("learnMoreAbout", { visa: targetVisaType.toUpperCase() })}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}

        {/* Restart */}
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
