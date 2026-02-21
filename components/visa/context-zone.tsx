import { getTranslations } from 'next-intl/server';
import {
  ChevronDown,
  Lightbulb,
  MessageCircle,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  ThumbsUp,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import type { Visa, CommunityTip } from '@/lib/types/visa';

interface ContextZoneProps {
  visa: Visa;
  country: string;
}

export async function ContextZone({ visa, country }: ContextZoneProps) {
  const t = await getTranslations('VisaDetail');

  return (
    <div>
      {/* FAQ */}
      {visa.faqs.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('faq')}</h2>
          </div>
          <div className="mt-4 rounded-lg border bg-white">
            {visa.faqs.map((faq, index) => (
              <details
                key={index}
                className={cn(
                  'group',
                  index < visa.faqs.length - 1 && 'border-b'
                )}
              >
                <summary className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium">
                  <span>{faq.question}</span>
                  <ChevronDown className="chevron h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 pt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      {visa.tips.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('tips')}</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {visa.tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Community Tips */}
      {visa.communityTips && visa.communityTips.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('communityTips')}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {visa.communityTips.map((tip) => (
              <CommunityTipCard key={tip.id} tip={tip} verifiedLabel={t('verified')} />
            ))}
          </div>
        </section>
      )}

      {/* Official Sources */}
      {visa.officialLinks.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('officialSources')}</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {visa.officialLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Related Visas */}
      {visa.relatedVisas && visa.relatedVisas.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('relatedVisas')}</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {visa.relatedVisas.map((visaType) => (
              <Link
                key={visaType}
                href={`/${country}/visa/${visaType}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                {visaType.toUpperCase()}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Last updated */}
      <p className="mt-12 text-sm text-muted-foreground">
        {t('lastUpdated', { date: visa.lastUpdated })}
      </p>
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
