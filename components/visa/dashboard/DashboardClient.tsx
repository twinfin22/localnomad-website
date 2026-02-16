'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import Link from 'next/link';
import type { Database } from '@/lib/supabase/database.types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { getVisaInfo } from '@/lib/visa/data';
import { parseLocalePath, buildLocalePath } from '@/lib/i18n/config';
import type { VisaInfo, VisaState, VisaType } from '@/lib/visa/types';
import type { DashboardData, ChecklistItem } from './dashboard-types';
import { EmptyState, ActiveDashboard } from './DashboardContent';

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
