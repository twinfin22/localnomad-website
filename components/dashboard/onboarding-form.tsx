'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { createVisa } from '@/lib/actions/dashboard';

type Step = 'country' | 'visa' | 'date';

const COUNTRY_OPTIONS = [
  { slug: 'korea', code: 'kr' as const, emoji: '🇰🇷', label: 'korea' as const },
  { slug: 'taiwan', code: 'tw' as const, emoji: '🇹🇼', label: 'taiwan' as const },
];

// Phase 1-4: only F-1-D for Korea, no Taiwan visas yet
const VISA_OPTIONS: Record<string, { type: string; label: string }[]> = {
  kr: [{ type: 'f-1-d', label: 'F-1-D (Accompanying Family)' }],
  tw: [],
};

export function OnboardingForm() {
  const t = useTranslations('Onboarding');
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<Step>('country');
  const [country, setCountry] = useState<'kr' | 'tw' | null>(null);
  const [visaType, setVisaType] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [skipDate, setSkipDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCountrySelect = (code: 'kr' | 'tw') => {
    setCountry(code);
    setVisaType(null);
    setStep('visa');
  };

  const handleVisaSelect = (type: string) => {
    setVisaType(type);
    setStep('date');
  };

  const handleSubmit = async () => {
    if (!country || !visaType) return;
    setLoading(true);
    setError(null);

    try {
      await createVisa({
        country,
        visa_type: visaType,
        expiry_date: skipDate || !expiryDate ? null : expiryDate,
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
        {(['country', 'visa', 'date'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-2 w-8 rounded-full transition-colors ${
              i <= ['country', 'visa', 'date'].indexOf(step)
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

      {/* Step 2: Visa */}
      {step === 'visa' && country && (
        <div>
          <h2 className="text-center text-lg font-semibold">
            {t('selectVisa')}
          </h2>
          <div className="mt-4 space-y-2">
            {VISA_OPTIONS[country]?.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                {t('noVisasAvailable')}
              </p>
            ) : (
              VISA_OPTIONS[country]?.map((visa) => (
                <button
                  key={visa.type}
                  onClick={() => handleVisaSelect(visa.type)}
                  className="flex min-h-[52px] w-full items-center rounded-lg border-2 border-neutral-200 px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5"
                >
                  {visa.label}
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => setStep('country')}
            className="mt-4 text-sm text-primary hover:underline"
          >
            &larr; {t('back')}
          </button>
        </div>
      )}

      {/* Step 3: Expiry date */}
      {step === 'date' && (
        <div>
          <h2 className="text-center text-lg font-semibold">
            {t('setExpiryDate')}
          </h2>
          <div className="mt-4 space-y-3">
            <input
              id="expiry-date"
              name="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => {
                setExpiryDate(e.target.value);
                setSkipDate(false);
              }}
              disabled={skipDate}
              className="block w-full rounded-lg border border-neutral-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              style={{ fontSize: '16px', minHeight: '44px' }}
            />

            <label htmlFor="skip-date" className="flex min-h-[44px] items-center gap-2 text-sm">
              <input
                id="skip-date"
                name="skip-date"
                type="checkbox"
                checked={skipDate}
                onChange={(e) => setSkipDate(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
              {t('noVisaYet')}
            </label>
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
            onClick={() => setStep('visa')}
            className="mt-3 text-sm text-primary hover:underline"
          >
            &larr; {t('back')}
          </button>
        </div>
      )}
    </div>
  );
}
