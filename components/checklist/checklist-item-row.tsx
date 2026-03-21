'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronDown, ExternalLink, Lock, LockOpen, TriangleAlert, BookOpen, Globe,
  Smartphone, FileText, CreditCard, Train, ClipboardList, Wifi, Shield, Home, UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistItem, ChecklistItemState } from '@/lib/types/checklist';

const CATEGORY_ICONS: Record<ChecklistItem['category'], React.ComponentType<{ className?: string }>> = {
  app: Smartphone,
  document: FileText,
  money: CreditCard,
  transport: Train,
  admin: ClipboardList,
  connectivity: Wifi,
  safety: Shield,
  housing: Home,
  food: UtensilsCrossed,
};

interface ChecklistItemRowProps {
  item: ChecklistItem;
  state: ChecklistItemState;
  onToggle: (id: string) => void;
  isGate?: boolean;
  estimatedWait?: string;
  blockedByLabel?: string;
  isNewlyUnlocked?: boolean;
  unlocksLabels?: string[];
}

export function ChecklistItemRow({
  item,
  state,
  onToggle,
  isGate,
  estimatedWait,
  blockedByLabel,
  isNewlyUnlocked,
  unlocksLabels,
}: ChecklistItemRowProps) {
  const t = useTranslations('Checklist');
  const [open, setOpen] = useState(false);
  const isBlocked = state === 'blocked';
  const isDone = state === 'done';
  const hasDetail = item.description || item.tips?.length || item.warnings?.length || item.link;
  const CategoryIcon = CATEGORY_ICONS[item.category];

  return (
    <div
      className={cn(
        'rounded-lg border bg-white',
        isBlocked && 'pointer-events-none opacity-60',
        isNewlyUnlocked && 'animate-unlock',
        isGate && state === 'actionable' && 'border-l-[3px] border-primary',
        isGate && isDone && 'border-l-[3px] border-green-500',
      )}
      data-state={isNewlyUnlocked ? 'newly-unlocked' : undefined}
    >
      <div className="flex min-h-[52px] items-center gap-3 px-4 py-3">
        {/* Checkbox (actionable/done) or Lock icon (blocked) */}
        {isBlocked ? (
          <div className="flex min-h-[44px] min-w-[44px] items-center justify-center">
            <Lock className="h-4 w-4 text-muted-foreground/50" />
          </div>
        ) : (
          <label className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center">
            <input
              type="checkbox"
              checked={isDone}
              onChange={() => onToggle(item.id)}
              aria-label={item.label}
              className="h-5 w-5 cursor-pointer accent-primary"
            />
          </label>
        )}

        <button
          type="button"
          onClick={() => !isBlocked && hasDetail && setOpen(!open)}
          aria-expanded={hasDetail && !isBlocked ? open : undefined}
          className={cn(
            'flex flex-1 items-center gap-3 text-left',
            (!hasDetail || isBlocked) && 'cursor-default'
          )}
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category icon */}
              <CategoryIcon
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground/70',
                  isBlocked && 'opacity-50',
                  isDone && 'text-muted-foreground',
                )}
              />

              <span
                className={cn(
                  'text-sm font-medium',
                  isDone && 'text-muted-foreground line-through',
                  isBlocked && 'text-muted-foreground/50'
                )}
              >
                {item.label}
              </span>

              {!item.required && (
                <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t('optional')}
                </span>
              )}

              {/* Gate badge */}
              {isGate && state === 'actionable' && (
                <span className="inline-flex items-center gap-1 rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
                  <LockOpen className="h-3 w-3" />
                  {t('unlocksMore')}
                </span>
              )}
              {isGate && isDone && (
                <span className="inline-flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                  <LockOpen className="h-3 w-3" />
                  {t('unlocked')}
                </span>
              )}
            </div>

            {/* Gate actionable: prominent estimated wait */}
            {isGate && state === 'actionable' && estimatedWait && (
              <p className="mt-0.5 text-xs font-medium text-primary">
                {t('estimatedWait', { wait: estimatedWait })}
              </p>
            )}

            {/* Gate actionable: what it unlocks */}
            {isGate && state === 'actionable' && unlocksLabels && unlocksLabels.length > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('unlocks', { items: unlocksLabels.join(', ') })}
              </p>
            )}

            {/* Blocked: "Requires: {label}" */}
            {isBlocked && blockedByLabel && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('requires', { label: blockedByLabel })}
                {estimatedWait && (
                  <span className="ml-1">(~{estimatedWait})</span>
                )}
              </p>
            )}
          </div>

          {hasDetail && !isBlocked && (
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          )}
        </button>
      </div>

      {open && hasDetail && !isBlocked && (
        <div className="border-t px-4 py-3 pl-[72px]">
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}

          {item.tips && item.tips.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {item.tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {tip}
                </li>
              ))}
            </ul>
          )}

          {item.link && (() => {
            const isExternal = item.link!.startsWith('http');
            const contextLabel = isExternal ? t('contextOfficial') : item.link!.includes('/blog/') ? t('contextReadMore') : item.link!.includes('/neighborhood/') ? t('contextNeighborhood') : item.link!.includes('/visa/') ? t('contextVisa') : t('contextReadMore');
            return (
              <div className="mt-3">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">{contextLabel}</p>
                <a
                  href={item.link!}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {isExternal ? <Globe className="h-3.5 w-3.5 shrink-0" /> : <BookOpen className="h-3.5 w-3.5 shrink-0" />}
                  {item.linkLabel || t('contextLearnMore')}
                  {isExternal && <ExternalLink className="h-3 w-3 shrink-0" />}
                </a>
              </div>
            );
          })()}

          {item.warnings && item.warnings.length > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="space-y-1">
                {item.warnings.map((warning, i) => (
                  <p key={i}>{warning}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blocked state: muted detail (no accordion, always visible) */}
      {isBlocked && hasDetail && (
        <div className="border-t px-4 py-3 pl-[72px] opacity-50">
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}

          {item.tips && item.tips.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {item.tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {tip}
                </li>
              ))}
            </ul>
          )}

          {item.link && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                {item.linkLabel || t('contextLearnMore')}
              </span>
            </div>
          )}

          {item.warnings && item.warnings.length > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800/60">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div className="space-y-1">
                {item.warnings.map((warning, i) => (
                  <p key={i}>{warning}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
