import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";

export default async function TermsPage() {
  const locale = await getLocale() as Locale;
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header locale={locale} />
      <article className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-fluid-section font-bold mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-12">Last Updated: February 2, 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <p>
              These Terms of Service govern your use of the website located at{" "}
              <a href="https://localnomad.club" className="text-primary hover:underline">
                https://localnomad.club
              </a>{" "}
              and any related services provided by Bulpyeonham(불편함) (hereinafter referred to as
              "the Company," "we," "us," or "our").
            </p>
            <p>
              By accessing localnomad.club and purchasing our services, you agree to abide by these
              Terms of Service and to comply with all applicable laws and regulations.
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Description of Services</h2>
              <p>
                LocalNomad provides specialized relocation and "soft-landing" support for digital
                nomads and remote workers in Seoul, South Korea. Our services include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Digital Products:</strong> Curated playbooks, checklists, and area
                  orientation guides ("Digital Materials").
                </li>
                <li>
                  <strong>Consulting Services:</strong> 1:1 onboarding calls and personalized Q&A.
                </li>
                <li>
                  <strong>Boots on the Ground:</strong> In-person accompaniment and logistical
                  support (Add-on services).
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                2. Intellectual Property & Limited License
              </h2>
              <p>
                The Digital Materials provided by LocalNomad are the intellectual property of the
                Company.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Personal Use Only:</strong> We grant you a non-exclusive, non-transferable
                  license to download and use the materials for your personal, non-commercial use
                  only.
                </li>
                <li>
                  <strong>Prohibited Actions:</strong> You shall not copy, redistribute, resell, or
                  publicly display any part of our Playbooks or guides without express written
                  consent from the Company. Any unauthorized sharing will result in immediate
                  termination of service without refund and may lead to legal action.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Payments and Refunds</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Pricing:</strong> All prices are listed in USD unless otherwise stated.
                </li>
                <li>
                  <strong>Refunds:</strong> Our services are subject to a specific tiered refund
                  structure due to the immediate delivery of digital assets and the reservation of
                  professional time. Please refer to our{" "}
                  <a href="/refund" className="text-primary hover:underline">
                    Refund Policy
                  </a>{" "}
                  for full details. By completing a purchase, you acknowledge and agree to the terms
                  of our Refund Policy.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                4. Limitation of Liability & Disclaimer
              </h2>
              <p className="font-semibold text-foreground">(IMPORTANT)</p>
              <p>
                Our services and materials are provided on an "as is" and "as available" basis for
                general informational purposes only.
              </p>
              <ul className="list-disc pl-6 space-y-2">
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
                  or service quality of third-party providers we may recommend or accompany you to
                  (e.g., banks, landlords, government offices).
                </li>
                <li>
                  <strong>Cap on Liability:</strong> To the maximum extent permitted by law, the
                  Company's total liability for any claim arising out of your use of our services
                  shall not exceed the total amount paid by you to the Company for the specific
                  service in question.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Accuracy of Materials</h2>
              <p>
                The materials appearing on our website or in our Playbooks could include technical,
                typographical, or photographic errors. While we aim to keep our "human-verified"
                context updated, we do not warrant that any of the materials are accurate, complete,
                or current at all times.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. User Responsibilities</h2>
              <p>
                You agree to provide accurate and complete information required for the onboarding
                process. You are responsible for your own safety and legal compliance during your
                stay in South Korea.
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
        </div>
      </article>
      <Footer locale={locale} />
    </main>
  );
}
