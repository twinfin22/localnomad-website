import Link from 'next/link';
import {
  FileText,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import type { useTranslations } from 'next-intl';
import type { VisaInfo } from '@/lib/visa/types';
import type { DashboardData } from './dashboard-types';

interface DashboardSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DashboardData;
  visa: VisaInfo | null;
  onSignOut: () => void;
  localePath: (path: string) => string;
  t: ReturnType<typeof useTranslations>;
}

export function DashboardSettings({
  open,
  onOpenChange,
  data,
  visa,
  onSignOut,
  localePath,
  t,
}: DashboardSettingsProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                onClick={() => onOpenChange(false)}
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
                onClick={() => onOpenChange(false)}
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                {t('viewVisaDetails')}
              </Link>
              <Link
                href={localePath(`/visa/checklist/${data.visaType}`)}
                className="flex items-center gap-2 p-3 rounded-lg bg-elevated border border-border hover:border-primary/30 transition-colors text-sm text-foreground"
                onClick={() => onOpenChange(false)}
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
                onOpenChange(false);
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
  );
}
