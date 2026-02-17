'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Sparkles,
  FileText,
  LogOut,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HealthScoreCard } from './HealthScoreCard';
import { DDayPanel } from './DDayPanel';
import { NextActionCard } from './NextActionCard';
import { DashboardSettings } from './DashboardSettings';
import { StatusBadge, InfoRow, formatDate } from './dashboard-helpers';
import type { DashboardData, ChecklistItem } from './dashboard-types';
import { toDateLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import type { useTranslations } from 'next-intl';
import type { VisaInfo } from '@/lib/visa/types';
import type { HealthScoreFactors } from '@/lib/visa/health-score';

// =============================================================================
// Empty State (No Progress)
// =============================================================================

export function EmptyState({ localePath, t }: { localePath: (path: string) => string; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          {t('startYourJourney')}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('takeQuizDesc')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Link href={localePath("/visa/find")}>
          <Button className="bg-primary hover:bg-accent-hover text-background font-semibold px-8 py-6 text-lg">
            <FileText className="w-5 h-5 mr-2" />
            {t('findMyVisa')}
          </Button>
        </Link>
        <Link href={localePath("/visa")}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground px-8 py-6 text-lg"
          >
            {t('browseAllVisas')}
          </Button>
        </Link>
      </div>

      {/* Quick Access Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href={localePath("/visa/e-7")} className="bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold text-primary">E-7</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {t('professionalWorkVisa')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('forSkilledWorkers')}</p>
            </div>
          </div>
        </Link>
        <Link href={localePath("/visa/f-1-d")} className="bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold text-emerald-400">F-1-D</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {t('digitalNomadVisa')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('forRemoteWorkers')}</p>
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
  data: DashboardData;
  visa: VisaInfo | null;
  checklist: ChecklistItem[];
  onSignOut: () => void;
  localePath: (path: string) => string;
  t: ReturnType<typeof useTranslations>;
  locale: Locale;
}

export function ActiveDashboard({ data, visa, checklist, onSignOut, localePath, t, locale }: ActiveDashboardProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const totalDocs = visa?.documents?.length || 0;
  const completedDocs = checklist.filter((item) => item.completed).length;
  const dateLocale = toDateLocale(locale);

  // Calculate health score factors
  const healthFactors: HealthScoreFactors = {
    documentsCompleted: completedDocs,
    documentsTotal: totalDocs || 1, // Prevent division by zero
    daysUntilTarget: data.targetDate
      ? Math.ceil(
          (new Date(data.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      : null,
    insuranceValid: true, // TODO: Track insurance status
    insuranceExpiresInDays: null,
    state: data.state,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
              {t('myDashboard')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('visaJourney', { visa: visa?.shortName || data.visaType.toUpperCase() })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-surface"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>

          <DashboardSettings
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            data={data}
            visa={visa}
            onSignOut={onSignOut}
            localePath={localePath}
            t={t}
          />
        </div>
      </div>

      {/* Glanceable Layer - Health Score + D-Day */}
      <div className="grid lg:grid-cols-3 gap-6">
        <HealthScoreCard factors={healthFactors} className="lg:col-span-2" />
        <DDayPanel
          targetDate={data.targetDate}
          expiryDate={data.expiryDate}
          state={data.state}
          locale={locale}
        />
      </div>

      {/* Action Layer - Next Action */}
      <NextActionCard
        state={data.state}
        visaType={data.visaType}
        documentsComplete={completedDocs}
        documentsTotal={totalDocs}
      />

      {/* Context Layer - Progress Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Document Progress */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('documentProgress')}
            </h3>
            <span className="text-sm text-muted-foreground">
              {completedDocs} / {totalDocs}
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  completedDocs === totalDocs
                    ? 'bg-emerald-500'
                    : completedDocs > totalDocs / 2
                    ? 'bg-primary'
                    : 'bg-amber-500'
                )}
                style={{
                  width: `${totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0}%`,
                }}
              />
            </div>

            {totalDocs > 0 && completedDocs < totalDocs && (
              <Link
                href={localePath(`/visa/checklist/${data.visaType}`)}
                className="block text-sm text-primary hover:text-accent-hover"
              >
                {t('documentsRemaining', { count: totalDocs - completedDocs })}
              </Link>
            )}

            {completedDocs === totalDocs && totalDocs > 0 && (
              <p className="text-sm text-emerald-400">
                {t('allDocsReady')}
              </p>
            )}
          </div>
        </div>

        {/* State Info */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('currentStatus')}
            </h3>
            <StatusBadge state={data.state} t={t} />
          </div>

          <div className="space-y-3">
            {data.submittedDate && (
              <InfoRow label={t('submitted')} value={formatDate(data.submittedDate, dateLocale)} />
            )}
            {data.approvedDate && (
              <InfoRow label={t('approved')} value={formatDate(data.approvedDate, dateLocale)} />
            )}
            {data.entryDate && (
              <InfoRow label={t('entryDate')} value={formatDate(data.entryDate, dateLocale)} />
            )}
            {!data.submittedDate && !data.approvedDate && (
              <p className="text-sm text-muted-foreground">
                {t('noStatusUpdates')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-surface/50 border border-border">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('dashboardDisclaimer')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <Link href={localePath(`/visa/${data.visaType}`)}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            {t('viewVisaDetails')}
          </Button>
        </Link>
        <Link href={localePath(`/visa/checklist/${data.visaType}`)}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            {t('openChecklist')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
