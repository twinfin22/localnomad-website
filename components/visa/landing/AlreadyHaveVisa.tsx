"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, ArrowRight, ChevronDown, Route, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseLocalePath, buildLocalePath } from "@/lib/i18n/config";

interface VisaOption {
  visa: string;
  name: string;
  href: string;
}

interface AlreadyHaveVisaProps {
  visaOptions: VisaOption[];
  pathSimulatorHref?: string;
}

export function AlreadyHaveVisa({ visaOptions, pathSimulatorHref }: AlreadyHaveVisaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("visa");
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const dashboardHref = buildLocalePath("/visa/dashboard", locale, country ?? undefined);

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl bg-surface border transition-colors",
          isOpen
            ? "border-primary/30 bg-elevated"
            : "border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground">{t("alreadyHaveVisa")}</span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <span className="text-sm">{t("seeYourOptions")}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 p-4 rounded-xl border border-border bg-surface">
          {/* Dashboard CTA */}
          <Link
            href={dashboardHref}
            className="flex items-center justify-between p-3 mb-4 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">{t("trackMyProgress")}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <p className="text-sm text-muted-foreground mb-4">
            {t("whichVisaDoYouHave")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visaOptions.map((option) => (
              <Link
                key={option.visa}
                href={option.href}
                className="flex items-center justify-between p-3 rounded-lg bg-elevated hover:bg-surface border border-border hover:border-primary/30 transition-colors group"
              >
                <div>
                  <span className="text-foreground font-medium">{option.visa}</span>
                  <span className="text-muted-foreground text-xs block">
                    {option.name}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          {/* Path simulator link */}
          {pathSimulatorHref && (
            <Link
              href={pathSimulatorHref}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-accent-hover transition-colors"
            >
              <Route className="w-4 h-4" />
              <span>{t("exploreTransitionPaths")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
