import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const alternates = getAlternates(locale, '/about');

  const title = 'About LocalNomad';
  const description =
    'LocalNomad makes visa information accessible for digital nomads in South Korea, Japan, and Taiwan. Clear requirements, document checklists, and community tips.';

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

  return (
    <main id="main-content" className="min-h-svh bg-background">
      <article className="mx-auto max-w-3xl px-6 py-24">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; Back to home
        </Link>

        <h1 className="mt-8 font-lora text-4xl font-bold">About LocalNomad</h1>

        <div className="mt-12 space-y-8 leading-relaxed text-muted-foreground">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">What We Do</h2>
            <p>
              LocalNomad is a visa information platform for digital nomads and remote
              workers exploring life in South Korea, Japan, and Taiwan. We compile
              published visa requirements, document checklists, and community-sourced
              tips into one clear, accessible resource.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
            <p>
              Navigating visa requirements across Asia shouldn&apos;t require hours of
              research across dozens of government websites and scattered forum posts.
              Our mission is to make visa information accessible, accurate, and easy to
              understand — so you can focus on what matters: building your life abroad.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">How We Work</h2>
            <p>
              We gather information from official government sources — including
              immigration authorities, embassies, and published regulations — and
              present it in a structured, comparable format. Our community of nomads
              across Asia contributes real-world experience and practical tips.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Important Notice</h2>
            <p>
              LocalNomad provides general information based on published requirements
              for educational purposes only. We are not a law firm, immigration
              consultancy, or licensed advisory service. The information on this
              platform does not constitute legal advice. For personalized guidance on
              your immigration situation, please consult a licensed immigration
              professional in your destination country.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
