"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Settings,
  Sparkles,
  FileText,
  Trash2,
  ArrowRight,
  Undo2,
  Send,
  Clock,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getStoredProgress,
  clearProgress,
  saveProgress,
  stateConfig,
  getNextStates,
  canTransition,
  updateProgressState,
  type VisaProgress,
  type VisaState,
} from "@/lib/visa/stateMachine";
import { getVisaInfo, getAllVisas } from "@/lib/visa/data";
import { HealthScoreCard } from "./dashboard/HealthScoreCard";
import { NextStepHero } from "./NextStepHero";
import { DocumentProgress } from "./DocumentProgress";
import { DDayCounter } from "./DDayCounter";
import { StateTimeline } from "./StateTimeline";
import { parseLocalePath, buildLocalePath } from "@/lib/i18n/config";
import type { VisaInfo, VisaType } from "@/lib/visa/types";
import type { HealthScoreFactors } from "@/lib/visa/health-score";

// =============================================================================
// Empty State (No Progress)
// =============================================================================

function EmptyState({ localePath }: { localePath: (path: string) => string }) {
  const t = useTranslations();
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          {t("dashboard.startYourJourney")}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("dashboard.takeQuizDesc")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Link href={localePath("/visa")}>
          <Button className="bg-primary hover:bg-accent-hover text-background font-semibold px-8 py-6 text-lg">
            <FileText className="w-5 h-5 mr-2" />
            {t("dashboard.findMyVisa")}
          </Button>
        </Link>
        <Link href={localePath("/visa")}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground px-8 py-6 text-lg"
          >
            {t("dashboard.browseAllVisas")}
          </Button>
        </Link>
      </div>

      {/* Quick Access Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href={localePath("/visa/e-7")} className="vk-card vk-card-hover p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold text-primary">E-7</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Professional Work Visa
              </h3>
              <p className="text-sm text-muted-foreground">For skilled workers</p>
            </div>
          </div>
        </Link>
        <Link href={localePath("/visa/d-2")} className="vk-card vk-card-hover p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold text-blue-400">D-2</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Student Visa
              </h3>
              <p className="text-sm text-muted-foreground">For degree programs</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// State Transition Button Configuration
// =============================================================================

interface TransitionAction {
  targetState: VisaState;
  label: string;
  description: string;
  confirmTitle: string;
  confirmDescription: string;
  icon: typeof Send;
  variant: "forward" | "backward";
}

/**
 * Returns the available transition actions for a given visa state,
 * with user-friendly labels and confirmation messages.
 */
function getTransitionActions(currentState: VisaState): TransitionAction[] {
  const actions: TransitionAction[] = [];
  const nextStates = getNextStates(currentState);

  for (const target of nextStates) {
    switch (target) {
      case "SUBMITTED":
        actions.push({
          targetState: "SUBMITTED",
          label: "I submitted my application",
          description: "Mark your application as submitted",
          confirmTitle: "Confirm Submission",
          confirmDescription:
            "Are you sure you have submitted your visa application? This will update your status to Submitted.",
          icon: Send,
          variant: "forward",
        });
        break;
      case "UNDER_REVIEW":
        actions.push({
          targetState: "UNDER_REVIEW",
          label: "It's under review",
          description: "Immigration is reviewing your application",
          confirmTitle: "Mark as Under Review",
          confirmDescription:
            "Confirm that your application is now under review by immigration.",
          icon: Clock,
          variant: "forward",
        });
        break;
      case "APPROVED":
        actions.push({
          targetState: "APPROVED",
          label: "I got approved!",
          description: "Your visa has been approved",
          confirmTitle: "Congratulations!",
          confirmDescription:
            "Confirm that your visa application has been approved. This will update your status to Approved.",
          icon: CheckCircle,
          variant: "forward",
        });
        break;
      case "ACTIVE":
        actions.push({
          targetState: "ACTIVE",
          label: "Visa is now active",
          description: "You have entered Korea with your visa",
          confirmTitle: "Activate Visa",
          confirmDescription:
            "Confirm that your visa is now active and you have entered Korea.",
          icon: CheckCircle,
          variant: "forward",
        });
        break;
      case "PREPARING":
        actions.push({
          targetState: "PREPARING",
          label: "Go back to Preparing",
          description: "Return to the preparation stage",
          confirmTitle: "Go Back to Preparing?",
          confirmDescription:
            "This will revert your status back to Preparing. Are you sure?",
          icon: Undo2,
          variant: "backward",
        });
        break;
      case "EXPIRING":
        actions.push({
          targetState: "EXPIRING",
          label: "Visa expiring soon",
          description: "Mark visa as expiring within 30 days",
          confirmTitle: "Mark as Expiring",
          confirmDescription:
            "This will mark your visa as expiring soon. Make sure to start the renewal process.",
          icon: Clock,
          variant: "forward",
        });
        break;
      case "EXPIRED":
        actions.push({
          targetState: "EXPIRED",
          label: "Visa has expired",
          description: "Mark visa as expired",
          confirmTitle: "Mark as Expired",
          confirmDescription:
            "This will mark your visa as expired. You will need to start a new application.",
          icon: Clock,
          variant: "forward",
        });
        break;
    }
  }

  return actions;
}

// =============================================================================
// State Advancement Buttons
// =============================================================================

interface StateAdvancementButtonsProps {
  progress: VisaProgress;
  onTransition: (newState: VisaState) => void;
}

function StateAdvancementButtons({
  progress,
  onTransition,
}: StateAdvancementButtonsProps) {
  const t = useTranslations();
  const actions = getTransitionActions(progress.state);

  if (actions.length === 0) return null;

  return (
    <div className="vk-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t("dashboard.updateStatus")}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <AlertDialog key={action.targetState}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-auto py-4 px-4 text-left flex items-start gap-3 border-border hover:bg-surface",
                  action.variant === "forward" &&
                    "hover:border-primary/50 hover:text-primary",
                  action.variant === "backward" &&
                    "hover:border-amber-500/50 hover:text-amber-400"
                )}
              >
                <action.icon
                  className={cn(
                    "w-5 h-5 mt-0.5 flex-shrink-0",
                    action.variant === "forward"
                      ? "text-primary"
                      : "text-amber-400"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <span className="block font-medium text-sm">
                    {action.label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {action.description}
                  </span>
                </div>
                {action.variant === "forward" ? (
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <Undo2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  {action.confirmTitle}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {action.confirmDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-muted-foreground hover:bg-surface hover:text-foreground">
                  {t("dashboard.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onTransition(action.targetState)}
                  className={cn(
                    action.variant === "forward"
                      ? "bg-primary hover:bg-accent-hover text-background"
                      : "bg-amber-500 hover:bg-amber-600 text-background"
                  )}
                >
                  {t("dashboard.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Dashboard Disclaimer
// =============================================================================

function DashboardDisclaimer() {
  const t = useTranslations();
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface/50 border border-border">
      <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t("dashboard.dashboardDisclaimer")}
      </p>
    </div>
  );
}

// =============================================================================
// Settings Sheet
// =============================================================================

interface SettingsSheetProps {
  progress: VisaProgress;
  onChangeVisaType: (type: VisaType) => void;
  onChangeTargetDate: (date: Date | undefined) => void;
  onReset: () => void;
}

function SettingsSheet({
  progress,
  onChangeVisaType,
  onChangeTargetDate,
  onReset,
}: SettingsSheetProps) {
  const allVisas = getAllVisas("en");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localTargetDate, setLocalTargetDate] = useState(
    progress.targetDate
      ? new Date(progress.targetDate).toISOString().split("T")[0]
      : ""
  );

  const handleDateChange = (dateStr: string) => {
    setLocalTargetDate(dateStr);
    if (dateStr) {
      onChangeTargetDate(new Date(dateStr));
    } else {
      onChangeTargetDate(undefined);
    }
  };

  const t = useTranslations();

  return (
    <div className="space-y-6 px-4 pb-4">
      {/* Change Visa Type */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          {t("dashboard.targetVisaType")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {allVisas.map((v) => (
            <button
              key={v.type}
              onClick={() => onChangeVisaType(v.type)}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                progress.visaType === v.type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {v.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Update Target Date */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          {t("dashboard.targetDate")}
        </h4>
        <input
          type="date"
          value={localTargetDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
        {localTargetDate && (
          <button
            onClick={() => handleDateChange("")}
            className="text-xs text-muted-foreground hover:text-foreground mt-2"
          >
            {t("dashboard.clearTargetDate")}
          </button>
        )}
      </div>

      {/* Reset All Progress */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">
          {t("dashboard.dangerZone")}
        </h4>
        {!showResetConfirm ? (
          <Button
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
            onClick={() => setShowResetConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("dashboard.resetAllProgress")}
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">
                  {t("dashboard.resetWarningTitle")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dashboard.resetWarningDesc")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-border text-muted-foreground hover:bg-surface"
                onClick={() => setShowResetConfirm(false)}
              >
                {t("dashboard.cancel")}
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={onReset}
              >
                {t("dashboard.deleteEverything")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Active Dashboard (Has Progress)
// =============================================================================

interface ActiveDashboardProps {
  progress: VisaProgress;
  visa: VisaInfo | null;
  onReset: () => void;
  onStateTransition: (newState: VisaState) => void;
  onChangeVisaType: (type: VisaType) => void;
  onChangeTargetDate: (date: Date | undefined) => void;
  localePath: (path: string) => string;
}

function ActiveDashboard({
  progress,
  visa,
  onReset,
  onStateTransition,
  onChangeVisaType,
  onChangeTargetDate,
  localePath,
}: ActiveDashboardProps) {
  const t = useTranslations();
  const currentStateConfig = stateConfig[progress.state];
  const isPreparing = progress.state === "PREPARING";
  const isWaiting = ["SUBMITTED", "UNDER_REVIEW"].includes(progress.state);
  const isActive = ["APPROVED", "ACTIVE"].includes(progress.state);
  const needsAttention = ["EXPIRING", "EXPIRED"].includes(progress.state);

  // Calculate document completion from per-type localStorage
  const [docCompleted, setDocCompleted] = useState(0);
  const [docTotal, setDocTotal] = useState(1);

  useEffect(() => {
    const storageKey = `visa-checklist-${progress.visaType}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const items: Record<string, boolean> = JSON.parse(stored);
        setDocCompleted(Object.values(items).filter(Boolean).length);
      }
    } catch {
      // Ignore parse errors
    }
    const totalDocs = visa?.documents?.length || 1;
    setDocTotal(totalDocs);
  }, [progress.visaType, visa]);

  // Calculate health score factors
  const healthFactors: HealthScoreFactors = {
    documentsCompleted: docCompleted,
    documentsTotal: docTotal,
    daysUntilTarget: progress.targetDate
      ? Math.ceil(
          (new Date(progress.targetDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : null,
    insuranceValid: true, // TODO: Track insurance status
    insuranceExpiresInDays: null,
    state: progress.state,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={localePath("/visa")}>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-surface"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("dashboard.myJourney")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {visa?.shortName || progress.visaType.toUpperCase()} Visa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-surface"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-foreground">{t("dashboard.settings")}</SheetTitle>
                <SheetDescription>
                  {t("dashboard.manageSettings")}
                </SheetDescription>
              </SheetHeader>
              <SettingsSheet
                progress={progress}
                onChangeVisaType={onChangeVisaType}
                onChangeTargetDate={onChangeTargetDate}
                onReset={onReset}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Next Step Hero */}
      <NextStepHero state={progress.state} visaType={progress.visaType} />

      {/* Health Score + D-Day Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <HealthScoreCard factors={healthFactors} className="lg:col-span-2" />

        {/* D-Day Counter */}
        <DDayCounter
          targetDate={progress.targetDate}
          label={
            progress.state === "ACTIVE"
              ? t("dashboard.visaExpires")
              : progress.state === "EXPIRING"
              ? t("dashboard.expiresIn")
              : t("dashboard.targetDate")
          }
        />
      </div>

      {/* Current Status Card */}
      <div className="vk-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("dashboard.currentStatus")}
          </h3>
          <span
            className={cn(
              "text-xs font-semibold px-3 py-1 rounded-full",
              isPreparing && "bg-primary/10 text-primary",
              isWaiting && "bg-amber-500/10 text-amber-400",
              isActive && "bg-emerald-500/10 text-emerald-400",
              needsAttention && "bg-red-500/10 text-red-400"
            )}
          >
            {currentStateConfig.label}
          </span>
        </div>
        <StateTimeline currentState={progress.state} compact />
      </div>

      {/* State Advancement Buttons */}
      <StateAdvancementButtons
        progress={progress}
        onTransition={onStateTransition}
      />

      {/* Document Progress (only show in PREPARING state) */}
      {isPreparing && <DocumentProgress visaType={progress.visaType} />}

      {/* Timeline (for non-PREPARING states) */}
      {!isPreparing && (
        <div className="vk-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {t("dashboard.yourJourney")}
          </h3>
          <StateTimeline currentState={progress.state} />
        </div>
      )}

      {/* Tips for waiting states */}
      {isWaiting && (
        <div className="vk-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("dashboard.whileYouWait")}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface/50">
              <h4 className="font-medium text-foreground mb-2">{t("dashboard.prepareForArrival")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.prepareForArrivalDesc")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface/50">
              <h4 className="font-medium text-foreground mb-2">{t("dashboard.bankingFinance")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.bankingFinanceDesc")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <DashboardDisclaimer />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <Link href={localePath(`/visa/${progress.visaType}`)}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            {t("dashboard.viewVisaDetails")}
          </Button>
        </Link>
        <Link href={localePath("/visa/compare")}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            {t("visa.compareVisas")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// Main StateDashboard Component
// =============================================================================

export function StateDashboard() {
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const localePath = (path: string) =>
    buildLocalePath(path, locale, country ?? undefined);
  const [progress, setProgress] = useState<VisaProgress | null>(null);
  const [visa, setVisa] = useState<VisaInfo | null>(null);
  useEffect(() => {
    const stored = getStoredProgress();
    if (stored) {
      setProgress(stored);
      const visaInfo = getVisaInfo(stored.visaType);
      setVisa(visaInfo);
    }
  }, []);

  const handleReset = () => {
    clearProgress();
    // Also clear per-type checklist data
    if (progress) {
      localStorage.removeItem(`visa-checklist-${progress.visaType}`);
    }
    setProgress(null);
    setVisa(null);
  };

  const handleStateTransition = (newState: VisaState) => {
    if (!progress) return;
    if (!canTransition(progress.state, newState)) return;

    const updatedProgress = updateProgressState(progress, newState);
    saveProgress(updatedProgress);
    setProgress(updatedProgress);
  };

  const handleChangeVisaType = (type: VisaType) => {
    if (!progress) return;
    const updated: VisaProgress = {
      ...progress,
      visaType: type,
      updatedAt: new Date(),
    };
    saveProgress(updated);
    setProgress(updated);
    setVisa(getVisaInfo(type));
  };

  const handleChangeTargetDate = (date: Date | undefined) => {
    if (!progress) return;
    const updated: VisaProgress = {
      ...progress,
      targetDate: date,
      updatedAt: new Date(),
    };
    saveProgress(updated);
    setProgress(updated);
  };

  return (
    <main className="min-h-screen visa-dark bg-background">
      {progress ? (
        <ActiveDashboard
          progress={progress}
          visa={visa}
          onReset={handleReset}
          onStateTransition={handleStateTransition}
          onChangeVisaType={handleChangeVisaType}
          onChangeTargetDate={handleChangeTargetDate}
          localePath={localePath}
        />
      ) : (
        <EmptyState localePath={localePath} />
      )}
    </main>
  );
}
