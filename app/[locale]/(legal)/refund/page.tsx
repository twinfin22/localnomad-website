import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

interface Props {
  params: Promise<{ locale: string }>;
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

        <h1 className="mt-8 font-lora text-4xl font-bold">Refund Policy</h1>
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
