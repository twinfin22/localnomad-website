'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import type { VisaTier } from '@/lib/types/checklist';

const TIER_STORAGE_KEY = (country: string) => `localnomad:checklist-tier:${country}`;

interface TierCardContent {
  visaNames: string;
  description: string;
  estimatedTime: string;
}

const TIER_CONTENT: Record<string, Record<VisaTier, TierCardContent>> = {
  korea: {
    tourist: {
      visaNames: 'B-1, B-2, visa-free (90 days)',
      description: 'No paperwork needed',
      estimatedTime: '~2 days',
    },
    'long-term': {
      visaNames: 'F-1-D, D-10, H-1',
      description: 'ARC + basic setup',
      estimatedTime: '~3 weeks',
    },
    resident: {
      visaNames: 'E-7, D-8, F-2, F-5, F-6',
      description: 'ARC + insurance + full setup',
      estimatedTime: '~6 weeks',
    },
  },
  japan: {
    tourist: {
      visaNames: 'Visa-free (90 days)',
      description: 'No paperwork needed',
      estimatedTime: '~2 days',
    },
    'long-term': {
      visaNames: 'Digital Nomad Visa (6 months)',
      description: 'Ward registration + basic setup',
      estimatedTime: '~2 weeks',
    },
    resident: {
      visaNames: 'Engineer, HSW, Student, Business Manager',
      description: 'Full registration + insurance',
      estimatedTime: '~8 weeks',
    },
  },
  taiwan: {
    tourist: {
      visaNames: 'Visa-free (90 days)',
      description: 'No paperwork needed',
      estimatedTime: '~2 days',
    },
    'long-term': {
      visaNames: 'Digital Nomad Visitor (1 year)',
      description: 'No ARC — limited access',
      estimatedTime: '~3 days',
    },
    resident: {
      visaNames: 'Gold Card, Work Permit',
      description: 'ARC + bank + full setup',
      estimatedTime: '~7 months',
    },
  },
};

const TIERS: VisaTier[] = ['tourist', 'long-term', 'resident'];

interface VisaTierSelectorProps {
  country: string;
  selectedTier: VisaTier;
  onTierChange: (tier: VisaTier) => void;
  tierCounts?: Record<VisaTier, number>;
}

export function VisaTierSelector({
  country,
  selectedTier,
  onTierChange,
  tierCounts,
}: VisaTierSelectorProps) {
  const t = useTranslations('Checklist');
  const searchParams = useSearchParams();

  // URL searchParam takes priority over localStorage on mount
  useEffect(() => {
    const urlTier = searchParams.get('tier') as VisaTier | null;
    if (urlTier && TIERS.includes(urlTier)) {
      onTierChange(urlTier);
    } else {
      const stored = typeof window !== 'undefined'
        ? localStorage.getItem(TIER_STORAGE_KEY(country))
        : null;
      if (stored && TIERS.includes(stored as VisaTier)) {
        onTierChange(stored as VisaTier);
      }
    }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  function handleSelect(tier: VisaTier) {
    onTierChange(tier);
    try {
      localStorage.setItem(TIER_STORAGE_KEY(country), tier);
    } catch {
      // ignore
    }
  }

  const content = TIER_CONTENT[country] ?? TIER_CONTENT['korea'];

  const tierLabels: Record<VisaTier, string> = {
    tourist: t('tierTourist'),
    'long-term': t('tierLongTerm'),
    resident: t('tierResident'),
  };

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-medium text-muted-foreground">{t('selectTier')}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {TIERS.map((tier) => {
          const isSelected = selectedTier === tier;
          const card = content[tier];
          return (
            <button
              key={tier}
              type="button"
              onClick={() => handleSelect(tier)}
              className={[
                'flex flex-col items-start rounded-lg border p-4 text-left transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary/5 -translate-y-1 shadow-md'
                  : 'border-border bg-background hover:border-primary/50 opacity-70 hover:opacity-90',
              ].join(' ')}
            >
              <div className="mb-1 flex w-full items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{tierLabels[tier]}</span>
                {tierCounts && (
                  <span className="text-xs text-muted-foreground">
                    {t('tierItemCount', { count: tierCounts[tier] })}
                  </span>
                )}
              </div>
              <span className="mb-1 text-xs text-muted-foreground">{card.description}</span>
              <span className="text-xs text-foreground/70">{card.visaNames}</span>
              <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                Est. completion: {card.estimatedTime}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
