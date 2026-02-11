import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DocumentChecklist } from "@/components/visa/DocumentChecklist";
import { AnimatedSection } from "@/components/animated-section";
import { CheckSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Document Checklist | LocalNomad Visa Guide",
  description:
    "Track your Korean visa document preparation with interactive checklists. Never miss a required document.",
};

export default function VisaChecklistPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-8 px-4 sm:px-6 relative overflow-hidden bg-secondary">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-3xl" />

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
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3">
                Document Checklist
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Track your document preparation progress. Check off items as you
                collect them to stay organized.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <DocumentChecklist />
        </div>
      </section>

      <Footer />
    </main>
  );
}
