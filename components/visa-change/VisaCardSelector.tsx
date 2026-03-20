'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface VisaCard {
  code: string;
  name: string;
  description: string;
}

interface VisaCategoryDef {
  labelKey: 'categoryWork' | 'categoryStudy' | 'categoryResidence' | 'categoryShortTerm';
  icon: string;
  visas: VisaCard[];
}

const VISA_CATEGORIES: VisaCategoryDef[] = [
  {
    labelKey: 'categoryWork',
    icon: '💼',
    visas: [
      { code: 'e-7', name: 'Professional Employment', description: 'Employer-sponsored skilled work' },
      { code: 'd-8', name: 'Corporate Investment', description: 'Startup founders & investors' },
    ],
  },
  {
    labelKey: 'categoryStudy',
    icon: '🎓',
    visas: [
      { code: 'd-2', name: 'Student', description: 'Enrolled at Korean university' },
      { code: 'd-10', name: 'Job Seeker', description: 'Seeking employment after study/work' },
    ],
  },
  {
    labelKey: 'categoryResidence',
    icon: '🏠',
    visas: [
      { code: 'f-2', name: 'Long-term Resident', description: 'Points-based residency' },
      { code: 'f-5', name: 'Permanent Resident', description: 'Korea PR (F-5)' },
      { code: 'f-6', name: 'Marriage / Spousal', description: 'Spouse of Korean national' },
    ],
  },
  {
    labelKey: 'categoryShortTerm',
    icon: '✈️',
    visas: [
      { code: 'f-1-d', name: 'Digital Nomad', description: 'Remote work for foreign companies' },
      { code: 'h-1', name: 'Working Holiday', description: 'Under 30, work + travel' },
      { code: 'b-2', name: 'Tourist / Short-term', description: 'Visa-exempt or tourist entry' },
    ],
  },
];

interface VisaCardSelectorProps {
  selectedFrom?: string;
  country: string;
}

export function VisaCardSelector({ selectedFrom, country }: VisaCardSelectorProps) {
  const t = useTranslations('VisaChange');
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(code: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('from') === code) {
      // Deselect — clear param
      params.delete('from');
    } else {
      params.set('from', code);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-4 flex items-center gap-0 border-b border-slate-200 bg-[#e8f0f5] px-5 py-3">
        <div className="flex flex-1 items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
              selectedFrom
                ? 'bg-[#1B4965] text-white'
                : 'bg-[#1B4965] text-white'
            }`}
          >
            1
          </span>
          <span className="text-sm font-medium text-[#1B4965]">{t('stepCurrentVisa')}</span>
        </div>
        <div className="mx-4 h-px w-6 bg-slate-300" aria-hidden="true" />
        <div className="flex flex-1 items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
              selectedFrom
                ? 'bg-[#1B4965] text-white'
                : 'bg-slate-300 text-slate-500'
            }`}
          >
            2
          </span>
          <span
            className={`text-sm font-medium ${
              selectedFrom ? 'text-[#1B4965]' : 'text-slate-400'
            }`}
          >
            {t('stepAvailablePaths')}
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div className="px-5 pb-3 pt-1">
        <h2 className="text-base font-bold text-foreground">{t('whatsYourVisa')}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{t('tapToSee')}</p>
      </div>

      {/* Visa categories */}
      <div className="px-5 pb-2">
        {VISA_CATEGORIES.map((cat) => (
          <div key={cat.labelKey} className="mb-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {cat.icon}&nbsp;&nbsp;{t(cat.labelKey)}
            </p>
            <div className="flex flex-col gap-2">
              {cat.visas.map((visa) => {
                const isSelected = selectedFrom === visa.code;
                return (
                  <button
                    key={visa.code}
                    onClick={() => handleSelect(visa.code)}
                    aria-pressed={isSelected}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-[#1B4965] bg-[#e8f0f5] shadow-[0_0_0_3px_rgba(27,73,101,0.1)]'
                        : 'border-slate-200 bg-white hover:border-[#1B4965] hover:shadow-md'
                    }`}
                  >
                    <span
                      className={`min-w-[52px] text-lg font-extrabold leading-none tracking-tight ${
                        isSelected ? 'text-[#1B4965]' : 'text-[#1B4965]'
                      }`}
                    >
                      {visa.code.toUpperCase()}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold leading-tight text-slate-800">
                        {visa.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {visa.description}
                      </span>
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isSelected ? 'text-[#1B4965]' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Not sure helper */}
      <div className="px-5 pb-6">
        <a
          href={`/${country}`}
          className="text-sm text-[#1B4965] underline underline-offset-2 hover:text-[#2e6b92]"
        >
          {t('notSureVisa')}
        </a>
      </div>
    </div>
  );
}
