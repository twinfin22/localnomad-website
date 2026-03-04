import { getTranslations } from 'next-intl/server';
import { DISCLAIMER_CONFIGS } from '@/lib/disclaimer-config';

interface VisaDisclaimerProps {
  country: string;
}

export async function VisaDisclaimer({ country }: VisaDisclaimerProps) {
  const t = await getTranslations('VisaDetail');
  const config = DISCLAIMER_CONFIGS[country];

  if (!config) return null;

  return (
    <div className="mt-12 border-t pt-6">
      {config.paragraphs.length === 1 ? (
        <p className="text-xs leading-relaxed text-muted-foreground" lang={config.paragraphs[0].lang}>
          {config.paragraphs[0].text}
        </p>
      ) : (
        <div className="space-y-4">
          {config.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-xs leading-relaxed text-muted-foreground" lang={paragraph.lang}>
              {paragraph.text}
            </p>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground/60">
        {t('disclaimer')}
      </p>
    </div>
  );
}
