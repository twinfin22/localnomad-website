import {
  Lightbulb,
  MessageCircle,
  CheckCircle,
  ThumbsUp,
  CalendarDays,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { CommunityTip } from '@/lib/types/visa';

interface TipsCommunityProps {
  tips: string[];
  communityTips?: CommunityTip[];
}

export function TipsCommunity({ tips, communityTips }: TipsCommunityProps) {
  const t = useTranslations('VisaDetail');

  return (
    <div className="space-y-8">
      {/* Tips */}
      {tips.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">{t('tips')}</h3>
          </div>
          <ul className="mt-4 space-y-2">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Community Tips */}
      {communityTips && communityTips.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">{t('communityTips')}</h3>
          </div>
          <div className="mt-4 space-y-3">
            {communityTips.map((tip) => (
              <CommunityTipCard
                key={tip.id}
                tip={tip}
                verifiedLabel={t('verified')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommunityTipCard({
  tip,
  verifiedLabel,
}: {
  tip: CommunityTip;
  verifiedLabel: string;
}) {
  const sourceColors: Record<string, string> = {
    reddit: 'bg-orange-100 text-orange-700',
    discord: 'bg-indigo-100 text-indigo-700',
    community: 'bg-blue-100 text-blue-700',
    official: 'bg-green-100 text-green-700',
  };

  const sourceColorClass =
    sourceColors[tip.source] ?? 'bg-neutral-100 text-neutral-700';

  return (
    <div className="rounded-lg border-l-4 border-l-primary/30 bg-white py-4 pl-5 pr-4">
      <p className="text-sm italic leading-relaxed text-muted-foreground">
        &ldquo;{tip.tip}&rdquo;
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
            sourceColorClass
          )}
        >
          {tip.source}
        </span>
        {tip.verified && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3.5 w-3.5" />
            {verifiedLabel}
          </span>
        )}
        {tip.upvotes !== undefined && tip.upvotes > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            {tip.upvotes}
          </span>
        )}
        {tip.dateAdded && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {tip.dateAdded}
          </span>
        )}
      </div>
    </div>
  );
}
