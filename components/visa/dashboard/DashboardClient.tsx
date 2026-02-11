'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Sparkles,
  FileText,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { getVisaInfo } from '@/lib/visa/data';
import { HealthScoreCard } from './HealthScoreCard';
import { DDayPanel } from './DDayPanel';
import { NextActionCard } from './NextActionCard';
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
        <Link href="/visa/find">
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
        <Link href="/visa/f-1-d" className="vk-card vk-card-hover p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold text-emerald-400">F-1-D</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Digital Nomad Visa
              </h3>
              <p className="text-sm text-muted-foreground">For remote workers</p>
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
}

function ActiveDashboard({ data, visa, checklist, onSignOut }: ActiveDashboardProps) {
  const totalDocs = visa?.documents?.length || 0;
  const completedDocs = checklist.filter((item) => item.completed).length;

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
              My Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              {visa?.shortName || data.visaType.toUpperCase()} Visa Journey
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-surface"
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
        </div>
      </div>

      {/* Glanceable Layer - Health Score + D-Day */}
      <div className="grid lg:grid-cols-3 gap-6">
        <HealthScoreCard factors={healthFactors} className="lg:col-span-2" />
        <DDayPanel
          targetDate={data.targetDate}
          expiryDate={data.expiryDate}
          state={data.state}
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
              Document Progress
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
                href={`/visa/checklist/${data.visaType}`}
                className="block text-sm text-primary hover:text-accent-hover"
              >
                {totalDocs - completedDocs} document
                {totalDocs - completedDocs !== 1 ? 's' : ''} remaining →
              </Link>
            )}

            {completedDocs === totalDocs && totalDocs > 0 && (
              <p className="text-sm text-emerald-400">
                All documents ready!
              </p>
            )}
          </div>
        </div>

        {/* State Info */}
        <div className="vk-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Current Status
            </h3>
            <StatusBadge state={data.state} />
          </div>

          <div className="space-y-3">
            {data.submittedDate && (
              <InfoRow label="Submitted" value={formatDate(data.submittedDate)} />
            )}
            {data.approvedDate && (
              <InfoRow label="Approved" value={formatDate(data.approvedDate)} />
            )}
            {data.entryDate && (
              <InfoRow label="Entry Date" value={formatDate(data.entryDate)} />
            )}
            {!data.submittedDate && !data.approvedDate && (
              <p className="text-sm text-muted-foreground">
                No status updates yet. Complete your checklist to proceed.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <Link href={`/visa/${data.visaType}`}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            View Visa Details
          </Button>
        </Link>
        <Link href={`/visa/checklist/${data.visaType}`}>
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            Open Checklist
          </Button>
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: VisaState }) {
  const config: Record<VisaState, { label: string; className: string }> = {
    NO_VISA: { label: 'No Visa', className: 'bg-muted-foreground/10 text-muted-foreground' },
    PREPARING: { label: 'Preparing', className: 'bg-primary/10 text-primary' },
    SUBMITTED: { label: 'Submitted', className: 'bg-amber-500/10 text-amber-400' },
    UNDER_REVIEW: { label: 'Under Review', className: 'bg-amber-500/10 text-amber-400' },
    APPROVED: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400' },
    ACTIVE: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-400' },
    EXPIRING: { label: 'Expiring', className: 'bg-red-500/10 text-red-400' },
    EXPIRED: { label: 'Expired', className: 'bg-red-500/10 text-red-400' },
  };

  const { label, className } = config[state] || config.PREPARING;

  return (
    <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', className)}>
      {label}
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
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

      // Define interfaces for Supabase responses
      interface VisaProgressRow {
        visa_type: string;
        state: string;
        target_date: string | null;
        submitted_date: string | null;
        approved_date: string | null;
        entry_date: string | null;
        expiry_date: string | null;
        notes: string | null;
      }

      interface ChecklistItemRow {
        document_id: string;
        completed: boolean;
      }

      // Fetch visa progress
      const progressResult = await supabase
        .from('visa_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const progressData = progressResult.data as VisaProgressRow | null;

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checklistData = checklistResult.data as ChecklistItemRow[] | null;

        if (checklistData) {
          setChecklist(
            checklistData.map((item) => ({
              documentId: item.document_id,
              completed: item.completed,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    router.push('/');
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to continue</h1>
          <p className="text-muted-foreground mb-6">
            Create an account to track your visa progress
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button className="bg-primary hover:bg-accent-hover text-background">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" className="border-border text-muted-foreground">
                Create Account
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
        />
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
