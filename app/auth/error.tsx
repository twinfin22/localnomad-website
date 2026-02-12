"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("title")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("description")}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {t("retryButton")}
        </button>
      </div>
    </div>
  );
}
