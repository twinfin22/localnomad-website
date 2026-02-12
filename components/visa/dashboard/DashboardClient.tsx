'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Settings,
  Sparkles,
  FileText,
  LogOut,
  User,
  Info,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/supabase/database.types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { getVisaInfo } from '@/lib/visa/data';
import { HealthScoreCard } from './HealthScoreCard';
import { DDayPanel } from './DDayPanel';
import { NextActionCard } from './NextActionCard';
import { parseLocalePath, buildLocalePath, toDateLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import type { VisaInfo, VisaState, VisaType } from '@/lib/visa/types';
import type { HealthScoreFactors } from '@/lib/visa/health-score';

interface DashboardData {
  visaType: VisaType;
  state: VisaState;
  targetDate?: string;
  submittedDate?: string;
  approvedDate?: string;
  entryDate?: string;
  expiryDate?: string;
  notes?: string;
}

interface ChecklistItem {
  documentId: string;
  completed: boolean;
}

// =============================================================================
// Empty State (No Progress)
// =============================================================================

function EmptyState({ localePath, t }: { localePath: (path: string) => string; t: ReturnType<typeof useTranslations> }) {
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
        <Link href={localePath("/visa/e-7")} className="vk-card vk-card-hover p-6 group">
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
        <Link href={localePath("/visa/f-1-d")} className="vk-card vk-card-hover p-6 group">
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

function ActiveDashboard({ data, visa, checklist, onSignOut, localePath, t, locale }: ActiveDashboardProps) {
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

          {/* Settings Sheet */}
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('settings')}</SheetTitle>
                <SheetDescription>
                  {t('manageSettings')}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 p-4">
                {/* Current Visa Type */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {t('currentVisa')}
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-elevated border border-border">
                    <div>
                      <p className="text-foreground font-medium">
                        {visa?.shortName || data.visaType.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {visa?.name || t('visaTypeLabel')}
                      </p>
                    </div>
                    <Link
                      href={localePath(`/visa/${data.visaType}`)}
                      className="text-primary hover:text-accent-hover transition-colors"
                      onClick={() => setSettingsOpen(false)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {t('quickLinks')}
                  </h4>
                  <div className="space-y-2">
                    <Link
                      href={localePath(`/visa/${data.visaType}`)}
                      className="flex items-center gap-2 p-3 rounded-lg bg-elevated border border-border hover:border-primary/30 transition-colors text-sm text-foreground"
                      onClick={() => setSettingsOpen(false)}
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {t('viewVisaDetails')}
                    </Link>
                    <Link
                      href={localePath(`/visa/checklist/${data.visaType}`)}
                      className="flex items-center gap-2 p-3 rounded-lg bg-elevated border border-border hover:border-primary/30 transition-colors text-sm text-foreground"
                      onClick={() => setSettingsOpen(false)}
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {t('openChecklist')}
                    </Link>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => {
                      setSettingsOpen(false);
                      onSignOut();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('signOut')}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
        <div className="vk-card p-6">
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
        <div className="vk-card p-6">
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

function StatusBadge({ state, t }: { state: VisaState; t: ReturnType<typeof useTranslations> }) {
  const config: Record<VisaState, { labelKey: string; className: string }> = {
    NO_VISA: { labelKey: 'noVisa', className: 'bg-muted-foreground/10 text-muted-foreground' },
    PREPARING: { labelKey: 'preparing', className: 'bg-primary/10 text-primary' },
    SUBMITTED: { labelKey: 'submitted', className: 'bg-amber-500/10 text-amber-400' },
    UNDER_REVIEW: { labelKey: 'underReview', className: 'bg-amber-500/10 text-amber-400' },
    APPROVED: { labelKey: 'approved', className: 'bg-emerald-500/10 text-emerald-400' },
    ACTIVE: { labelKey: 'active', className: 'bg-emerald-500/10 text-emerald-400' },
    EXPIRING: { labelKey: 'expiring', className: 'bg-red-500/10 text-red-400' },
    EXPIRED: { labelKey: 'expired', className: 'bg-red-500/10 text-red-400' },
  };

  const { labelKey, className } = config[state] || config.PREPARING;

  return (
    <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', className)}>
      {t(labelKey)}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function formatDate(dateString: string, dateLocale: string): string {
  return new Date(dateString).toLocaleDateString(dateLocale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// =============================================================================
// Main DashboardClient Component
// =============================================================================

export function DashboardClient() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const localePath = (path: string) =>
    buildLocalePath(path, locale, country ?? undefined);
  const t = useTranslations('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [visa, setVisa] = useState<VisaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }


      // Fetch visa progress
      const progressResult = await supabase
        .from('visa_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @supabase/ssr generic inference resolves to never
      const progressData = progressResult.data as any as Database['public']['Tables']['visa_progress']['Row'] | null;

      if (progressData) {
        const data: DashboardData = {
          visaType: progressData.visa_type as VisaType,
          state: (progressData.state as VisaState) || 'PREPARING',
          targetDate: progressData.target_date ?? undefined,
          submittedDate: progressData.submitted_date ?? undefined,
          approvedDate: progressData.approved_date ?? undefined,
          entryDate: progressData.entry_date ?? undefined,
          expiryDate: progressData.expiry_date ?? undefined,
          notes: progressData.notes ?? undefined,
        };
        setDashboardData(data);

        // Fetch visa info
        const visaInfo = getVisaInfo(data.visaType);
        setVisa(visaInfo);

        // Fetch checklist items
        const checklistResult = await supabase
          .from('checklist_items')
          .select('document_id, completed')
          .eq('user_id', user.id)
          .eq('visa_type', data.visaType);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @supabase/ssr generic inference resolves to never
        const checklistData = checklistResult.data as any as Pick<Database['public']['Tables']['checklist_items']['Row'], 'document_id' | 'completed'>[] | null;

        if (checklistData) {
          setChecklist(
            checklistData.map((item) => ({
              documentId: item.document_id,
              completed: item.completed,
            }))
          );
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching dashboard data:', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);

  const handleSignOut = async () => {
    await signOut();
    router.push(localePath('/'));
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-surface rounded" />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="h-48 bg-surface rounded-2xl lg:col-span-2" />
              <div className="h-48 bg-surface rounded-2xl" />
            </div>
            <div className="h-32 bg-surface rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('signInToContinue')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('createAccountDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={localePath("/auth/login")}>
              <Button className="bg-primary hover:bg-accent-hover text-background">
                {t('signIn')}
              </Button>
            </Link>
            <Link href={localePath("/auth/signup")}>
              <Button variant="outline" className="border-border text-muted-foreground">
                {t('createAccount')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {dashboardData ? (
        <ActiveDashboard
          data={dashboardData}
          visa={visa}
          checklist={checklist}
          onSignOut={handleSignOut}
          localePath={localePath}
          t={t}
          locale={locale}
        />
      ) : (
        <EmptyState localePath={localePath} t={t} />
      )}
    </main>
  );
}
