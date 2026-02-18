import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  return (
    <main id="main-content" className="min-h-svh bg-background">
      <article className="mx-auto max-w-3xl px-6 py-24">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; Back to home
        </Link>

        <h1 className="mt-8 font-lora text-4xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: February 19, 2026</p>

        <div className="mt-12 space-y-8 leading-relaxed text-muted-foreground">
          <p>
            These Terms of Service govern your use of the website located at{' '}
            <a href="https://localnomad.club" className="text-primary hover:underline">
              https://localnomad.club
            </a>{' '}
            and any related services provided by Bulpyeonham(불편함) (hereinafter referred to as
            &ldquo;the Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
          </p>
          <p>
            By accessing localnomad.club and using our services, you agree to abide by these
            Terms of Service and to comply with all applicable laws and regulations.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Description of Services</h2>
            <p>
              LocalNomad is a visa information platform for digital nomads and remote workers.
              Our services include:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Visa Information:</strong> Detailed visa requirement pages, comparison
                tools, and informational dashboards for countries including South Korea and Taiwan.
              </li>
              <li>
                <strong>Community Resources:</strong> Curated tips, FAQs, and application
                timelines based on published government requirements and community experience.
              </li>
            </ul>
            <p>
              LocalNomad is currently a free service. Paid features will be announced separately
              when introduced.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              2. Intellectual Property & Limited License
            </h2>
            <p>
              The content provided by LocalNomad, including text, graphics, and data
              compilations, is the intellectual property of the Company.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Personal Use Only:</strong> We grant you a non-exclusive, non-transferable
                license to use our website content for your personal, non-commercial reference only.
              </li>
              <li>
                <strong>Prohibited Actions:</strong> You shall not copy, redistribute, resell, or
                publicly display any part of our website content without express written consent
                from the Company. Any unauthorized reproduction or redistribution may result in
                termination of access and may lead to legal action.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Payments and Refunds</h2>
            <p>
              LocalNomad is currently a free service. When paid features are introduced, separate
              payment terms and refund policies will be published. Please refer to our{' '}
              <Link href="/refund" className="text-primary hover:underline">
                Refund Policy
              </Link>{' '}
              for current details.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              4. Limitation of Liability & Disclaimer
            </h2>
            <p className="font-semibold text-foreground">(IMPORTANT)</p>
            <p>
              Our services and materials are provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis for general informational purposes only.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>No Professional Advice:</strong> LocalNomad is not a law firm, real estate
                agency, or financial institution. The information provided does not constitute
                legal, tax, or professional financial advice. In accordance with the Korean
                행정사법 (Administrative Scrivener Act) and 변호사법 (Attorney Act), LocalNomad
                does not file visa applications or immigration documents on behalf of users,
                does not provide legal representation before immigration authorities, and does
                not broker connections to licensed professionals for a fee. For immigration
                legal matters, consult a licensed Korean 행정사 (administrative scrivener) or
                변호사 (attorney).
              </li>
              <li>
                <strong>No Guarantee of Results:</strong> While we strive for 100% accuracy, local
                regulations (banking, immigration, housing) in South Korea change frequently. The
                Company does not guarantee specific outcomes, such as the successful opening of a
                bank account, issuance of a visa, or securing of a specific rental property, as
                these are subject to third-party policies and individual circumstances.
              </li>
              <li>
                <strong>Third-Party Actions:</strong> We are not liable for the conduct, errors,
                or service quality of third-party providers we may recommend (e.g., banks,
                landlords, government offices).
              </li>
              <li>
                <strong>Cap on Liability:</strong> To the maximum extent permitted by law, the
                Company&apos;s total liability for any claim arising out of your use of our
                services shall not exceed the total amount paid by you to the Company for the
                specific service in question.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on our website could include technical, typographical, or
              photographic errors. While we aim to keep our content updated, we do not warrant
              that any of the materials are accurate, complete, or current at all times.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. User Responsibilities</h2>
            <p>
              You agree to provide accurate and complete information when using our website and
              services. You are responsible for your own safety and legal compliance during your
              stay in any country.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Right to Terminate</h2>
            <p>
              We reserve the right to suspend or terminate your access to our website and services
              immediately, without prior notice, if you breach any of these Terms of Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of
              the Republic of Korea (South Korea). You irrevocably submit to the exclusive
              jurisdiction of the courts in Seoul, South Korea, for the resolution of any
              disputes.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
