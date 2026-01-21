"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function EmailCaptureSection() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setEmail("");
      setFirstName("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <section id="email-capture" className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden relative">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Subtle ambient effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto max-w-2xl text-center relative z-10">
        <AnimatedSection>
          <h2 className="text-fluid-section font-bold mb-4 text-balance text-white">
            Get Free Local Resources
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 text-balance">
            A curated archive of vetted resources for your first days in Seoul — accommodation, banking, SIM cards, and more.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={150}>
          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold mb-2 text-white">Check your inbox!</p>
                <p className="text-white/90">
                  We've sent the resource archive to your email.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={status === "loading"}
                  className="sm:w-1/3 h-12 bg-white/15 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50 focus-visible:border-white focus-visible:bg-white/20 transition-all duration-200"
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                  className="flex-1 h-12 bg-white/15 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50 focus-visible:border-white focus-visible:bg-white/20 transition-all duration-200"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={status === "loading"}
                className="h-12 px-6 font-semibold w-full sm:w-auto sm:self-center bg-white text-primary hover:bg-white/90 hover:-translate-y-0.5 shadow-soft-md hover:shadow-soft-lg transition-all duration-300"
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Get Free Access
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-4 text-sm text-red-200 animate-in fade-in duration-300">{errorMessage}</p>
          )}
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <p className="mt-6 text-sm text-white/70">
            No spam, ever. Unsubscribe anytime.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
