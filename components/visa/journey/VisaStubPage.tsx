"use client";

import Link from "next/link";
import { ArrowLeft, Construction, ExternalLink, Bell } from "lucide-react";
import type { VisaInfo } from "@/lib/visa/types";
import { LegalDisclaimer } from "@/components/visa/LegalDisclaimer";

interface VisaStubPageProps {
  visa: VisaInfo;
  backHref: string;
}

export function VisaStubPage({ visa, backHref }: VisaStubPageProps) {
  return (
    <main className="min-h-screen bg-[#0B1120]">
      {/* Back link */}
      <div className="container mx-auto max-w-4xl px-4 pt-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to visa guide
        </Link>
      </div>

      {/* Header */}
      <header className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
            <span className="text-cyan-400 font-bold text-lg">{visa.shortName}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {visa.name}
            </h1>
            <p className="text-slate-400 mt-1">{visa.tagline}</p>
          </div>
        </div>
      </header>

      {/* Coming Soon Message */}
      <section className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Construction className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Full guide coming soon
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            We&apos;re working on a comprehensive guide for the {visa.shortName} visa.
            In the meantime, check out the official resources below.
          </p>
        </div>
      </section>

      {/* Key Info (if available) */}
      {visa.keyRequirement && (
        <section className="container mx-auto max-w-4xl px-4 py-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
              Key Requirement
            </h3>
            <p className="text-white">{visa.keyRequirement}</p>
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <section className="container mx-auto max-w-4xl px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Duration</p>
            <p className="text-white font-medium">{visa.duration.initial}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Application Fee</p>
            <p className="text-white font-medium">{visa.fees.application}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Work Permission</p>
            <p className="text-white font-medium">
              {visa.workPermission.allowed ? "Yes" : "No"}
              {visa.workPermission.restrictions?.length ? " (with restrictions)" : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Official Resources */}
      <section className="container mx-auto max-w-4xl px-4 py-8">
        <h3 className="text-lg font-semibold text-white mb-4">Official Resources</h3>
        <div className="space-y-3">
          {visa.officialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-cyan-500/30 transition-colors group"
            >
              <span className="text-slate-300 group-hover:text-white transition-colors">
                {link.label}
              </span>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* Notify Me (optional future feature) */}
      <section className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Want to be notified?</h3>
              <p className="text-slate-400 text-sm">
                We&apos;ll let you know when the full {visa.shortName} guide is ready.
                Join our newsletter on the homepage to stay updated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="container mx-auto max-w-4xl px-4 py-8">
        <LegalDisclaimer variant="box" />
      </section>
    </main>
  );
}
