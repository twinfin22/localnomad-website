"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedSection } from "@/components/animated-section";
import { Download, CheckCircle, Loader2 } from "lucide-react";

export function CtaSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <AnimatedSection>
          <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-primary/20 rounded-3xl p-8 sm:p-14 text-center overflow-hidden shadow-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-6 mx-auto shadow-md">
                <Download className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Get Your Free Pre-Arrival Checklist
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                25+ essential items to prepare before landing in Korea.
                <br className="hidden sm:block" />
                From documents to apps to cultural tips.
              </p>

            {status === "success" ? (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span>Check your email for the download link!</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-background"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Get Free Checklist
                    </>
                  )}
                </Button>
              </form>
            )}

            {status === "error" && (
              <p className="text-red-500 text-sm mt-4">
                Something went wrong. Please try again.
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-6">
              No spam, ever. Unsubscribe anytime.
            </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
