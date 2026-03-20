import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { Instagram, Mail } from 'lucide-react';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Contact' });
  const alternates = getAlternates(locale, '/contact');

  const title = t('metaTitle');
  const description = t('metaDescription');

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.png'],
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'Contact' }),
    getTranslations({ locale, namespace: 'Common' }),
  ]);

  return (
    <main id="main-content" className="min-h-svh bg-background">
      <article className="mx-auto max-w-3xl px-6 py-24">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; {tCommon('backToHome')}
        </Link>

        <h1 className="mt-8 font-lora text-4xl font-bold text-primary">{t('pageTitle')}</h1>

        <div className="mt-12 space-y-8 leading-relaxed text-muted-foreground">
          <p>{t('intro')}</p>

          <div className="space-y-6">
            {/* Discord */}
            <div className="flex items-start gap-4 rounded-lg border p-5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mt-0.5 shrink-0 text-primary"
                aria-hidden="true"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{t('discordTitle')}</h2>
                <p className="mt-1 text-sm">{t('discordDesc')}</p>
                <a
                  href="https://discord.gg/localnomad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  {t('discordLink')}
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 rounded-lg border p-5">
              <Mail className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{t('emailTitle')}</h2>
                <p className="mt-1 text-sm">{t('emailDesc')}</p>
                <a
                  href="mailto:hello@localnomad.club"
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  hello@localnomad.club
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-start gap-4 rounded-lg border p-5">
              <Instagram className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{t('instagramTitle')}</h2>
                <p className="mt-1 text-sm">{t('instagramDesc')}</p>
                <a
                  href="https://www.instagram.com/localnomad.club/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  @localnomad.club
                </a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg bg-muted/50 px-5 py-4">
            <p className="text-sm">{t('disclaimer')}</p>
          </div>
        </div>
      </article>
    </main>
  );
}
