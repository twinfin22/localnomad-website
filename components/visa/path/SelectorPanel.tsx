import Link from "next/link";
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
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import {
  STARTING_POINTS,
  VISA_DISPLAY_INFO,
} from "@/lib/visa/path-data";
import type { VisaType } from "@/lib/visa/types";
import type { TranslationFn } from "./path-types";

// =============================================================================
// Step 1: Starting Point Selector
// =============================================================================

export function StartingPointSelector({
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

export function DestinationSelector({
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
