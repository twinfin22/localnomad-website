'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { createVisa } from '@/lib/actions/dashboard';
import type { VisaCountry } from '@/lib/types/dashboard';

type Step = 'country' | 'goalVisa' | 'currentVisa';

const COUNTRY_OPTIONS = [
  { code: 'kr' as const, emoji: '🇰🇷', label: 'korea' as const },
  { code: 'tw' as const, emoji: '🇹🇼', label: 'taiwan' as const },
  { code: 'jp' as const, emoji: '🇯🇵', label: 'japan' as const },
  { code: 'cn' as const, emoji: '🇨🇳', label: 'china' as const },
];

const VISA_OPTIONS: Record<VisaCountry, { type: string; label: string }[]> = {
  kr: [
    { type: 'f-1-d', label: 'F-1-D — Digital Nomad Visa' },
    { type: 'e-7', label: 'E-7 — Professional Employment' },
    { type: 'd-8', label: 'D-8 — Corporate Investment' },
    { type: 'f-2', label: 'F-2 — Points-Based Resident' },
    { type: 'h-1', label: 'H-1 — Working Holiday' },
  ],
  tw: [
    { type: 'gold-card', label: 'Gold Card — Employment Gold Card' },
    { type: 'dnv', label: 'DNV — Digital Nomad Visa' },
  ],
  jp: [
    { type: 'digital-nomad', label: 'Digital Nomad Visa' },
    { type: 'business-manager', label: 'Business Manager Visa' },
    { type: 'engineer', label: 'Engineer / Specialist in Humanities' },
  ],
  cn: [
    { type: 'z-visa', label: 'Z Visa — Work Visa' },
    { type: 'k-visa', label: 'K Visa — STEM Talent' },
    { type: 'x1-visa', label: 'X1 Visa — Long-term Study' },
  ],
};

export function OnboardingForm() {
  const t = useTranslations('Onboarding');
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<Step>('country');
  const [country, setCountry] = useState<VisaCountry | null>(null);
  const [goalVisaType, setGoalVisaType] = useState<string | null>(null);
  const [hasCurrentVisa, setHasCurrentVisa] = useState(false);
  const [currentVisaType, setCurrentVisaType] = useState<string | null>(null);
  const [currentExpiryDate, setCurrentExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCountrySelect = (code: VisaCountry) => {
    setCountry(code);
    setGoalVisaType(null);
    setHasCurrentVisa(false);
    setCurrentVisaType(null);
    setCurrentExpiryDate('');
    setStep('goalVisa');
  };

  const handleGoalVisaSelect = (type: string) => {
    setGoalVisaType(type);
    setStep('currentVisa');
  };

  const handleSubmit = async () => {
    if (!country || !goalVisaType) return;
    setLoading(true);
    setError(null);

    try {
      await createVisa({
        country,
        goal_visa_type: goalVisaType,
        current_visa_type: hasCurrentVisa ? currentVisaType : null,
        current_expiry_date: hasCurrentVisa && currentExpiryDate ? currentExpiryDate : null,
      });
      router.push(`/${locale}/dashboard`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (
          err.message.includes('fetch') ||
          err.message.includes('network')
        ) {
          setError(t('errorNetwork'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('error'));
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {(['country', 'goalVisa', 'currentVisa'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-2 w-8 rounded-full transition-colors ${
              i <= ['country', 'goalVisa', 'currentVisa'].indexOf(step)
                ? 'bg-primary'
                : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Country */}
      {step === 'country' && (
        <div>
          <h2 className="text-center text-lg font-semibold">
            {t('selectCountry')}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {COUNTRY_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => handleCountrySelect(opt.code)}
                className="flex min-h-[80px] flex-col items-center justify-center rounded-lg border-2 border-neutral-200 p-4 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="mt-1 text-sm font-medium">
                  {t(opt.label)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Goal Visa */}
      {step === 'goalVisa' && country && (
        <div>
          <h2 className="text-center text-lg font-semibold">
            {t('selectGoalVisa')}
          </h2>
          <div className="mt-4 space-y-2">
            {VISA_OPTIONS[country]?.map((visa) => (
              <button
                key={visa.type}
                onClick={() => handleGoalVisaSelect(visa.type)}
                className="flex min-h-[52px] w-full items-center rounded-lg border-2 border-neutral-200 px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5"
              >
                {visa.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('country')}
            className="mt-4 text-sm text-primary hover:underline"
          >
            &larr; {t('back')}
          </button>
        </div>
      )}

      {/* Step 3: Current Visa */}
      {step === 'currentVisa' && (
        <div>
          <h2 className="text-center text-lg font-semibold">
            {t('currentVisaQuestion')}
          </h2>
          <div className="mt-4 space-y-3">
            <label
              htmlFor="no-current-visa"
              className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors ${
                !hasCurrentVisa
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                id="no-current-visa"
                name="has-current-visa"
                type="radio"
                checked={!hasCurrentVisa}
                onChange={() => {
                  setHasCurrentVisa(false);
                  setCurrentVisaType(null);
                  setCurrentExpiryDate('');
                }}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-medium">{t('noCurrentVisa')}</span>
            </label>

            <label
              htmlFor="has-current-visa"
              className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors ${
                hasCurrentVisa
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                id="has-current-visa"
                name="has-current-visa"
                type="radio"
                checked={hasCurrentVisa}
                onChange={() => setHasCurrentVisa(true)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-medium">
                {t('hasCurrentVisa')}
              </span>
            </label>

            {hasCurrentVisa && country && (
              <div className="space-y-3 pl-7">
                <div>
                  <label
                    htmlFor="current-visa-type"
                    className="mb-1 block text-sm text-muted-foreground"
                  >
                    {t('selectCurrentVisa')}
                  </label>
                  <select
                    id="current-visa-type"
                    name="current-visa-type"
                    value={currentVisaType ?? ''}
                    onChange={(e) =>
                      setCurrentVisaType(e.target.value || null)
                    }
                    className="block w-full rounded-lg border border-neutral-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{ fontSize: '16px', minHeight: '44px' }}
                  >
                    <option value="">—</option>
                    {VISA_OPTIONS[country]?.map((visa) => (
                      <option key={visa.type} value={visa.type}>
                        {visa.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="current-expiry-date"
                    className="mb-1 block text-sm text-muted-foreground"
                  >
                    {t('currentExpiryDate')}
                  </label>
                  <input
                    id="current-expiry-date"
                    name="current-expiry-date"
                    type="date"
                    value={currentExpiryDate}
                    onChange={(e) => setCurrentExpiryDate(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{ fontSize: '16px', minHeight: '44px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('goToDashboard')
            )}
          </button>

          <button
            onClick={() => setStep('goalVisa')}
            className="mt-3 text-sm text-primary hover:underline"
          >
            &larr; {t('back')}
          </button>
        </div>
      )}
    </div>
  );
}
