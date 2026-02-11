import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Stamp, ArrowRight, Sparkles, BarChart3, CheckSquare, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisaCard } from "@/components/visa/VisaCard";
import { getAllVisas } from "@/lib/visa/data";
import { AnimatedSection } from "@/components/animated-section";
import Link from "next/link";

export default function VisaPage() {
  const visas = getAllVisas("en");

  return (
    <main className="min-h-screen overflow-x-hidden visa-dark">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden bg-vk-gradient">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <AnimatedSection>
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-2xl bg-vk-cyan/10 flex items-center justify-center mb-6 mx-auto glow-cyan-sm">
                <Stamp className="w-8 h-8 text-vk-cyan" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-heading text-vk-white">
                VisaKorea
              </h1>
              <p className="text-lg text-vk-slate max-w-2xl mx-auto mb-8">
                Navigate Korean visa requirements with step-by-step guides,
                document checklists, and progress tracking.
              </p>

              {/* Target Personas */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-vk-navy-light border border-vk-cyan/20">
                  <Briefcase className="w-4 h-4 text-vk-cyan" />
                  <span className="text-sm text-vk-white">E-7 Professionals</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-vk-navy-light border border-cyan-500/20">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-vk-white">D-2 Students</span>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/visa/start">
                  <Button
                    size="lg"
                    className="bg-vk-cyan hover:bg-cyan-400 text-vk-navy font-semibold glow-cyan"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Find Your Visa
                  </Button>
                </Link>
                <Link href="/visa/compare">
                  <Button size="lg" variant="outline" className="border-vk-cyan/30 text-vk-cyan hover:bg-vk-cyan/10 hover:border-vk-cyan">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Compare Visas
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Visa Types Grid */}
      <section className="py-12 px-4 sm:px-6 bg-vk-navy">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold font-heading text-vk-white">Visa Types</h2>
                <p className="text-vk-slate">
                  Select a visa to view detailed requirements and guides
                </p>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {visas.map((visa) => (
              <AnimatedSection key={visa.type}>
                <VisaCard visa={visa} darkMode />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 bg-vk-navy-light">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="inline-block text-sm font-semibold text-vk-cyan uppercase tracking-widest mb-4">
                Features
              </span>
              <h2 className="text-3xl font-bold font-heading mb-4 text-vk-white">
                Everything You Need
              </h2>
              <p className="text-vk-slate max-w-2xl mx-auto">
                Tools to help you through every step of your visa journey
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedSection>
              <Link href="/visa/start">
                <div className="group vk-card p-6 vk-card-hover transition-all duration-300 h-full cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-vk-cyan/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:glow-cyan-sm transition-all">
                    <Sparkles className="w-6 h-6 text-vk-cyan" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-vk-white">
                    Find Your Visa
                  </h3>
                  <p className="text-sm text-vk-slate mb-4">
                    Answer a few questions to discover the best visa for your
                    situation and start your journey.
                  </p>
                  <span className="inline-flex items-center text-sm text-vk-cyan font-medium group-hover:underline">
                    Start Now
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </AnimatedSection>

            <AnimatedSection>
              <Link href="/visa/compare">
                <div className="group vk-card p-6 vk-card-hover transition-all duration-300 h-full cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:glow-cyan-sm transition-all">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-vk-white">Visa Comparison</h3>
                  <p className="text-sm text-vk-slate mb-4">
                    Compare multiple visas side-by-side to see which fits best.
                  </p>
                  <span className="inline-flex items-center text-sm text-vk-cyan font-medium group-hover:underline">
                    Compare Now
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </AnimatedSection>

            <AnimatedSection>
              <Link href="/visa/checklist">
                <div className="group vk-card p-6 vk-card-hover transition-all duration-300 h-full cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:glow-success transition-all">
                    <CheckSquare className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-vk-white">
                    Document Checklist
                  </h3>
                  <p className="text-sm text-vk-slate mb-4">
                    Track your document preparation with interactive checklists.
                  </p>
                  <span className="inline-flex items-center text-sm text-vk-cyan font-medium group-hover:underline">
                    View Checklists
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 px-4 sm:px-6 bg-vk-navy">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-semibold text-amber-400 mb-2">
                Important Notice
              </h3>
              <p className="text-sm text-vk-slate max-w-2xl mx-auto">
                This information is for general guidance only. Visa requirements
                change frequently. Always verify current requirements with the{" "}
                <a
                  href="https://www.immigration.go.kr/immigration_eng/index.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vk-cyan underline hover:text-cyan-300"
                >
                  Korea Immigration Service
                </a>{" "}
                or{" "}
                <a
                  href="https://www.hikorea.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vk-cyan underline hover:text-cyan-300"
                >
                  HiKorea
                </a>{" "}
                before applying.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </main>
  );
}
