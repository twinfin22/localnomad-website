import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ScrollReveal } from './scroll-reveal';

export const BeforeAfter = async () => {
  const t = await getTranslations('Landing');

  return (
    <section className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <h2 className="mb-10 text-center font-lora text-2xl font-bold text-foreground sm:text-3xl">
            {t('beforeLabel')}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* Left: Gov site screenshot (blurred) */}
            <div className="flex flex-col">
              <div
                className="relative flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                style={{ minHeight: '380px' }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-200 px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-400/70" />
                  <div className="h-2 w-2 rounded-full bg-yellow-400/70" />
                  <div className="h-2 w-2 rounded-full bg-green-400/70" />
                  <div className="ml-2 flex-1 truncate rounded-sm bg-white/70 px-2 py-0.5 font-mono text-[8px] text-gray-400">
                    www.moj.go.jp/isa/immigration/procedures/...
                  </div>
                </div>

                {/* Blurred screenshot */}
                <div className="relative h-full w-full" style={{ minHeight: '340px' }}>
                  <Image
                    src="/images/gov-screenshot.jpg"
                    alt="Government immigration website"
                    fill
                    className="object-cover object-top"
                    style={{ filter: 'blur(1.5px)' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Slight dark overlay for contrast with label */}
                  <div className="absolute inset-0 bg-gray-900/10" />
                </div>
              </div>
            </div>

            {/* Right: LN visa page mockup */}
            <div className="flex flex-col">
              <div
                className="relative flex-1 overflow-hidden rounded-xl border-2 border-primary/20 bg-white shadow-md"
                style={{ minHeight: '340px' }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-300" />
                  <div className="ml-2 flex-1 truncate rounded bg-gray-100 px-2 py-0.5 font-mono text-[9px] text-gray-400">
                    localnomad.club/en/korea/visa/d-8
                  </div>
                </div>

                <div className="p-5">
                  {/* Visa badge + title */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                      🇰🇷 Korea · D-8 Visa
                    </div>
                    <h3 className="mt-2 text-base font-bold text-gray-900">
                      Corporate Investment Visa
                    </h3>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      For foreign nationals investing in or operating a Korean business
                    </p>
                  </div>

                  {/* Quick info bar */}
                  <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2.5">
                    {[
                      { label: 'Fee', value: '$50 USD' },
                      { label: 'Timeline', value: '5–10 days' },
                      { label: 'Duration', value: '1–3 years' },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="text-[11px] font-semibold text-gray-900">
                          {item.value}
                        </div>
                        <div className="text-[9px] text-gray-400">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Requirements checklist */}
                  <div>
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Requirements
                    </div>
                    <ul className="space-y-1.5">
                      {[
                        'Valid passport (6+ months remaining)',
                        'Certificate of incorporation',
                        'Business registration document',
                        'Proof of investment (min. $100,000 USD)',
                        '2 passport-size photographs',
                      ].map((req, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-[11px] text-gray-700"
                        >
                          <svg
                            className="mt-0.5 h-3 w-3 shrink-0 text-primary"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle
                              cx="6"
                              cy="6"
                              r="5.5"
                              stroke="currentColor"
                              strokeWidth="1"
                            />
                            <path
                              d="M3.5 6l2 2 3-3"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-sm font-bold text-primary">
                {t('afterLabel')}
              </p>
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
