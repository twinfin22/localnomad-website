import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [t, alternates] = await Promise.all([
    getTranslations({ locale, namespace: 'About' }),
    Promise.resolve(getAlternates(locale, '/about')),
  ]);

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

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'About' }),
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
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{t('whatWeDoTitle')}</h2>
            <p>{t('whatWeDoBody')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{t('ourMissionTitle')}</h2>
            <p>{t('ourMissionBody')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{t('howWeWorkTitle')}</h2>
            <p>{t('howWeWorkBody')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{t('importantNoticeTitle')}</h2>
            <p>{t('importantNoticeBody')}</p>
          </section>
        </div>
      </article>
    </main>
  );
}
