import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";

export default async function PrivacyPage() {
  const locale = await getLocale() as Locale;
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header locale={locale} />
      <article className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-fluid-section font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">
            Effective Date: February 2, 2026 · Last Updated: February 2, 2026
          </p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <p>
              Your privacy is important to us. It is the policy of Bulpyeonham(불편함), operating as
              "LocalNomad", to respect your privacy and comply with any applicable law and
              regulation regarding any personal information we may collect about you across our
              website,{" "}
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
                  We collect information you knowingly provide when subscribing to our newsletter or
                  purchasing our "Soft Landing" packages. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Identity Data:</strong> Name, Nationality.
                  </li>
                  <li>
                    <strong>Contact Data:</strong> Email address, WhatsApp/Telegram ID, or other
                    social media handles.
                  </li>
                  <li>
                    <strong>Relocation Data:</strong> Planned arrival date in Seoul, housing
                    preferences, and specific areas of interest for your stay.
                  </li>
                </ul>
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
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and deliver the LocalNomad Playbooks and Consulting services.</li>
                <li>
                  Communicate with you regarding your onboarding call and area orientation.
                </li>
                <li>Send you curated local resources and updates (only with your consent).</li>
                <li>Analyze website performance and improve user experience.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                3. Third-Party Service Providers
              </h2>
              <p>
                To provide a seamless global service, we share limited data with the following
                trusted partners:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>LemonSqueezy:</strong> For secure payment processing and digital
                  fulfillment.
                </li>
                <li>
                  <strong>Google Analytics:</strong> To understand website traffic and user
                  behavior.
                </li>
                <li>
                  <strong>Calendly/Zoom:</strong> To schedule and conduct onboarding calls.
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
              <ul className="list-disc pl-6 space-y-2">
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
                  time using the "Unsubscribe" link.
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
        </div>
      </article>
      <Footer locale={locale} />
    </main>
  );
}
