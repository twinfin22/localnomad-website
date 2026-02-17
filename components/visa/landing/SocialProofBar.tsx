"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getVisaTypes } from '@/lib/visa/data';

interface SocialProofBarProps {
  className?: string;
}

export function SocialProofBar({ className }: SocialProofBarProps) {
  const t = useTranslations();
  const visaCount = getVisaTypes().length;
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  return (
    <div className={className}>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 py-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{visaCount}</span>
            <span>{t("visa.visaTypesCovered", { count: visaCount })}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span>{t("common.updated")}</span>
            <span className="font-semibold text-foreground">{formattedDate}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span>{t("common.basedOn")}</span>
            <span className="font-semibold text-foreground">{t("visa.officialRequirements")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
