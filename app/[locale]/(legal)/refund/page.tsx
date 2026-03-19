import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const alternates = getAlternates(locale, '/refund');

  return {
    title: t('refundTitle'),
    description: t('refundDescription'),
    alternates,
    openGraph: {
      title: t('refundTitle'),
      description: t('refundDescription'),
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('refundTitle'),
      description: t('refundDescription'),
      images: ['/og-default.png'],
    },
  };
}

export default async function RefundPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  return (
    <main id="main-content" className="min-h-svh bg-background">
      <article className="mx-auto max-w-3xl px-6 py-24">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; Back to home
        </Link>

        <h1 className="mt-8 font-lora text-4xl font-bold text-primary">Refund Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: February 19, 2026</p>

        <div className="mt-12 space-y-8 leading-relaxed text-muted-foreground">
          <p>
            LocalNomad is currently a free service. When paid features are introduced, a detailed
            refund policy will be published here.
          </p>
          <p>
            For questions, contact us at{' '}
            <a href="mailto:hey@localnomad.club" className="text-primary hover:underline">
              hey@localnomad.club
            </a>
            .
          </p>
        </div>
      </article>
    </main>
  );
}
