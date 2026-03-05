import { CheckCircle, ThumbsUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CommunityTip } from '@/lib/types/visa';

interface TipsCommunityProps {
  tips: string[];
  communityTips?: CommunityTip[];
}

export function TipsCommunity({ communityTips }: TipsCommunityProps) {
  const t = useTranslations('VisaDetail');

  if (!communityTips || communityTips.length === 0) return null;

  return (
    <div className="space-y-4">
      {communityTips.map((tip) => (
        <CommunityTipCard
          key={tip.id}
          tip={tip}
          verifiedLabel={t('verified')}
        />
      ))}
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
  return (
    <div className="rounded-lg border-l-4 border-l-primary/50 bg-white py-5 pl-6 pr-5 transition-shadow hover:shadow-sm">
      <p className="text-base italic leading-relaxed text-muted-foreground">
        &ldquo;{tip.tip}&rdquo;
      </p>
      {(tip.verified || (tip.upvotes !== undefined && tip.upvotes > 0)) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
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
        </div>
      )}
    </div>
  );
}
