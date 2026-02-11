"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Sparkles,
  FileText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getStoredProgress,
  clearProgress,
  stateConfig,
  type VisaProgress,
} from "@/lib/visa/stateMachine";
import { getVisaInfo } from "@/lib/visa/data";
import { NextStepHero } from "./NextStepHero";
import { DocumentProgress } from "./DocumentProgress";
import { DDayCounter } from "./DDayCounter";
import { StateTimeline } from "./StateTimeline";
import type { VisaInfo } from "@/lib/visa/types";

// =============================================================================
// Empty State (No Progress)
// =============================================================================

function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Start Your Visa Journey
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Take our quick quiz to find the right visa for you, then track your
          progress all the way to approval.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Link href="/visa/start">
          <Button className="bg-primary hover:bg-accent-hover text-background font-semibold px-8 py-6 text-lg">
            <FileText className="w-5 h-5 mr-2" />
            Find My Visa
          </Button>
        </Link>
        <Link href="/visa">
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground px-8 py-6 text-lg"
          >
            Browse All Visas
          </Button>
        </Link>
      </div>

      {/* Quick Access Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/visa/e-7" className="vk-card vk-card-hover p-6 group">
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
        <Link href="/visa/d-2" className="vk-card vk-card-hover p-6 group">
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
// Active Dashboard (Has Progress)
// =============================================================================

interface ActiveDashboardProps {
  progress: VisaProgress;
  visa: VisaInfo | null;
  onReset: () => void;
}

function ActiveDashboard({ progress, visa, onReset }: ActiveDashboardProps) {
  const currentStateConfig = stateConfig[progress.state];
  const isPreparing = progress.state === "PREPARING";
  const isWaiting = ["SUBMITTED", "UNDER_REVIEW"].includes(progress.state);
  const isActive = ["APPROVED", "ACTIVE"].includes(progress.state);
  const needsAttention = ["EXPIRING", "EXPIRED"].includes(progress.state);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/visa">
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
              My Journey
            </h1>
            <p className="text-sm text-muted-foreground">
              {visa?.shortName || progress.visaType.toUpperCase()} Visa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            onClick={onReset}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-surface"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Next Step Hero */}
      <NextStepHero state={progress.state} visaType={progress.visaType} />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* D-Day Counter */}
        <DDayCounter
          targetDate={progress.targetDate}
          label={
            progress.state === "ACTIVE"
              ? "Visa Expires"
              : progress.state === "EXPIRING"
              ? "Expires In"
              : "Target Date"
          }
        />

        {/* Current Status Card */}
        <div className="vk-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Current Status
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
      </div>

      {/* Document Progress (only show in PREPARING state) */}
      {isPreparing && <DocumentProgress visaType={progress.visaType} />}

      {/* Timeline (for non-PREPARING states) */}
      {!isPreparing && (
        <div className="vk-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Your Journey
          </h3>
          <StateTimeline currentState={progress.state} />
        </div>
      )}

      {/* Tips for waiting states */}
      {isWaiting && (
        <div className="vk-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            While You Wait
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface/50">
              <h4 className="font-medium text-foreground mb-2">Prepare for Arrival</h4>
              <p className="text-sm text-muted-foreground">
                Research neighborhoods, housing options, and get familiar with Korean life.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface/50">
              <h4 className="font-medium text-foreground mb-2">Banking & Finance</h4>
              <p className="text-sm text-muted-foreground">
                Learn about Korean banks and how to set up accounts as a foreigner.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <Link href={`/visa/${progress.visaType}`}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            View Visa Details
          </Button>
        </Link>
        <Link href="/visa/compare">
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            Compare Visas
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
  const [progress, setProgress] = useState<VisaProgress | null>(null);
  const [visa, setVisa] = useState<VisaInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredProgress();
    if (stored) {
      setProgress(stored);
      const visaInfo = getVisaInfo(stored.visaType);
      setVisa(visaInfo);
    }
  }, []);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
      clearProgress();
      setProgress(null);
      setVisa(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen visa-dark bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-surface rounded" />
            <div className="h-32 bg-surface rounded-2xl" />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="h-40 bg-surface rounded-2xl" />
              <div className="h-40 bg-surface rounded-2xl lg:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen visa-dark bg-background">
      {progress ? (
        <ActiveDashboard progress={progress} visa={visa} onReset={handleReset} />
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
