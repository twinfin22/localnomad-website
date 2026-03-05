import { Lightbulb } from 'lucide-react';
import type { CommunityTip } from '@/lib/types/visa';

interface TipsCommunityProps {
  tips: string[];
  communityTips?: CommunityTip[];
}

export function TipsCommunity({ communityTips }: TipsCommunityProps) {
  if (!communityTips || communityTips.length === 0) return null;

  return (
    <div className="space-y-4">
      {communityTips.map((tip) => (
        <CommunityTipCard key={tip.id} tip={tip} />
      ))}
    </div>
  );
}

function CommunityTipCard({ tip }: { tip: CommunityTip }) {
  return (
    <div className="rounded-lg border-l-4 border-l-primary/50 bg-white py-5 pl-6 pr-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-2">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-base italic leading-relaxed text-muted-foreground">
          {tip.tip}
        </p>
      </div>
    </div>
  );
}
