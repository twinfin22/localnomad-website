import { ExternalLink, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { VisaType } from '@/lib/types/visa';

interface SourcesRelatedProps {
  officialLinks: { label: string; url: string }[];
  relatedVisas?: VisaType[];
  lastUpdated: string;
  country: string;
}

export function SourcesRelated({
  officialLinks,
  relatedVisas,
  lastUpdated,
  country,
}: SourcesRelatedProps) {
  const t = useTranslations('VisaDetail');

  return (
    <div className="space-y-8">
      {/* Official Sources */}
      {officialLinks.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">{t('officialSources')}</h3>
          </div>
          <ul className="mt-4 space-y-2 pl-7">
            {officialLinks.map((link, index) => (
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
        </div>
      )}

      {/* Related Visas */}
      {relatedVisas && relatedVisas.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">{t('relatedVisas')}</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 pl-7">
            {relatedVisas.map((visaType) => (
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
        </div>
      )}

      {/* Last updated */}
      <p className="text-sm text-muted-foreground">
        {t('lastUpdated', { date: lastUpdated })}
      </p>
    </div>
  );
}
