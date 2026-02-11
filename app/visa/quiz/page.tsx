import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EligibilityQuiz } from "@/components/visa/EligibilityQuiz";
import { AnimatedSection } from "@/components/animated-section";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Find Your Visa | LocalNomad Visa Guide",
  description:
    "Answer a few questions to find the best Korean visa for your situation. Get personalized visa recommendations.",
};

export default function VisaQuizPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-8 px-4 sm:px-6 relative overflow-hidden bg-secondary">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <AnimatedSection>
            <Link
              href="/visa"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Visa Dashboard
            </Link>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3">
                Find Your Visa
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Answer a few questions to get personalized visa recommendations
                based on your situation, goals, and qualifications.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Quiz */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-2xl">
          <EligibilityQuiz />
        </div>
      </section>

      <Footer />
    </main>
  );
}
