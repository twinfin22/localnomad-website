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
  const alternates = getAlternates(locale, '/privacy');

  return {
    title: t('privacyTitle'),
    description: t('privacyDescription'),
    alternates,
    openGraph: {
      title: t('privacyTitle'),
      description: t('privacyDescription'),
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('privacyTitle'),
      description: t('privacyDescription'),
      images: ['/og-default.png'],
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  return (
    <main id="main-content" className="min-h-svh bg-background">
      <article className="mx-auto max-w-3xl px-6 py-24">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; Back to home
        </Link>

        <h1 className="mt-8 font-lora text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective Date: February 19, 2026 · Last Updated: February 19, 2026
        </p>

        <div className="mt-12 space-y-8 leading-relaxed text-muted-foreground">
          <p>
            Your privacy is important to us. It is the policy of Bulpyeonham(불편함), operating as
            &ldquo;LocalNomad&rdquo;, to respect your privacy and comply with any applicable law
            and regulation regarding any personal information we may collect about you across our
            website,{' '}
            <a href="https://localnomad.club" className="text-primary hover:underline">
              https://localnomad.club
            </a>
            .
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Voluntarily Provided Information
              </h3>
              <p>
                We collect information you knowingly provide when creating an account or
                subscribing to our newsletter. This includes:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Contact Data:</strong> Email address (via magic link signup through
                  Supabase authentication).
                </li>
                <li>
                  <strong>Dashboard Usage:</strong> Visa type selection and checklist progress
                  when using our dashboard features.
                </li>
              </ul>
              <p>
                <strong>Taiwan-specific data:</strong> Any data entered into Taiwan-related
                calculators or checklists is processed entirely in your browser (client-side only)
                and is never transmitted to our servers.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Automatically Collected Information
              </h3>
              <p>
                When you visit our website, our servers may automatically log standard data
                provided by your web browser, such as IP address, browser type, geo-location data,
                and time spent on pages.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              2. Legitimate Reasons for Processing
            </h2>
            <p>We process your information to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Provide visa information and dashboard functionality.</li>
              <li>Deliver service improvement analytics.</li>
              <li>Send you updates and resources (only with your consent).</li>
              <li>Analyze website performance and improve user experience.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              3. Third-Party Service Providers
            </h2>
            <p>
              To provide our service, we share limited data with the following trusted partners:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Supabase:</strong> For authentication (magic link login) and database
                services.
              </li>
              <li>
                <strong>Google Analytics (GA4):</strong> To understand website traffic and user
                behavior. GA4 collects anonymized usage data.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              4. Data Security and Retention
            </h2>
            <p>
              We implement commercially acceptable security measures to protect your data. We
              retain your personal information only for as long as necessary to provide you with
              our services or to comply with legal, accounting, or reporting obligations
              (typically 3 years for transaction records under Korean law).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              5. Your Rights (GDPR & PIPA Compliance)
            </h2>
            <p>Regardless of your location, you have the following rights:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Access & Correction:</strong> You may request a copy of the data we hold
                or ask for corrections.
              </li>
              <li>
                <strong>Deletion:</strong> You may request that we delete your personal
                information.
              </li>
              <li>
                <strong>Opt-out:</strong> You can unsubscribe from our marketing emails at any
                time using the &ldquo;Unsubscribe&rdquo; link.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              6. International Data Transfers
            </h2>
            <p>
              As a global service based in South Korea, your data may be transferred and processed
              in servers located outside of your home country. By using our services, you consent
              to such transfers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>
              For any questions regarding this policy or your data, please contact us at:
            </p>
            <p>
              <strong>LocalNomad</strong>
              <br />
              <a href="mailto:hey@localnomad.club" className="text-primary hover:underline">
                hey@localnomad.club
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
