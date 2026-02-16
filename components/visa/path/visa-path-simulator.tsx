"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import {
  STARTING_POINTS,
  getDestinationsFromPaths,
  getPathsToDestination,
  VISA_DISPLAY_INFO,
  type SimulatorPath,
} from "@/lib/visa/path-data";
import type { VisaType } from "@/lib/visa/types";
import type { SimulatorStep } from "./path-types";
import { ProgressBar } from "./ProgressBar";
import { StartingPointSelector, DestinationSelector } from "./SelectorPanel";
import { PathViewer } from "./PathResults";

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
