import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";

export default async function RefundPage() {
  const locale = await getLocale() as Locale;
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header locale={locale} />
      <article className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-fluid-section font-bold mb-4">Refund Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last Updated: February 2, 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <p>
              At LocalNomad, we strive to ensure your "soft landing" in Seoul is as smooth as
              possible. Because our services involve immediate access to proprietary digital content
              and the reservation of professional consulting time, we adhere to the following refund
              policy.
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Refund Schedule</h2>
              <p>We offer a tiered refund structure based on the stage of service delivery:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">
                        Timeline & Condition
                      </th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">
                        Refundable Amount
                      </th>
                      <th className="text-left py-3 font-semibold text-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">Post-payment (Before Playbook is sent)</td>
                      <td className="py-3 pr-4 text-green-600 dark:text-green-400 font-medium">
                        100% Refund
                      </td>
                      <td className="py-3">Excluding third-party transaction fees.</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">
                        After receiving the Playbook / More than 48 hrs before Call
                      </td>
                      <td className="py-3 pr-4 text-yellow-600 dark:text-yellow-400 font-medium">
                        70% Refund
                      </td>
                      <td className="py-3">A $50 non-refundable fee applies for digital access.</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">24 to 48 hours before the Onboarding Call</td>
                      <td className="py-3 pr-4 text-orange-600 dark:text-orange-400 font-medium">
                        50% Refund
                      </td>
                      <td className="py-3">Covers scheduling and preparation costs.</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Within 24 hours of the Call / No-show</td>
                      <td className="py-3 pr-4 text-red-600 dark:text-red-400 font-medium">
                        Non-refundable
                      </td>
                      <td className="py-3">Service is considered fully rendered.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                2. Digital Assets (Playbooks & Guides)
              </h2>
              <p>
                Once the LocalNomad Playbook or any digital resources have been delivered to your
                email, they are considered "used" due to their digital nature. Therefore, a fixed
                digital asset fee ($50) is non-refundable in any cancellation scenario occurring
                after delivery.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Transaction Fees</h2>
              <p>
                Please note that third-party payment processing fees (e.g., Wise, Stripe, etc.) are
                non-refundable as these fees are collected by the payment processors, not by
                LocalNomad.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. How to Request a Refund</h2>
              <p>
                To request a refund, please contact us at{" "}
                <a href="mailto:hey@localnomad.club" className="text-primary hover:underline">
                  hey@localnomad.club
                </a>{" "}
                with the following information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Full Name</li>
                <li>Order Number</li>
                <li>Reason for Cancellation</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Processing Time</h2>
              <p>
                Refunds will be reviewed and processed within 3 to 5 business days of receiving your
                request. The actual reflection of funds in your account may vary depending on your
                financial institution or payment method.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Rescheduling Policy</h2>
              <p>
                Instead of a refund, you may request to reschedule your onboarding call once (1) for
                free, provided the request is made at least 24 hours before the original scheduled
                time.
              </p>
            </section>
          </div>
        </div>
      </article>
      <Footer locale={locale} />
    </main>
  );
}
