import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Instagram, Newspaper } from 'lucide-react';

export async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="bg-primary text-white/70">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Main row */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Left — brand */}
          <span className="font-lora-brand text-lg italic text-white">
            LocalNomad
          </span>

          {/* Center — nav links */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
            <Link href="/terms" className="transition-colors hover:text-white">{t('terms')}</Link>
            <Link href="/privacy" className="transition-colors hover:text-white">{t('privacy')}</Link>
            <Link href="/refund" className="transition-colors hover:text-white">{t('refund')}</Link>
            <Link href="/about" className="transition-colors hover:text-white">{t('about')}</Link>
            <Link href="/contact" className="transition-colors hover:text-white">{t('contact')}</Link>
          </div>

          {/* Right — social + Discord */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/localnomad.club/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={t('instagram')}
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://startofsomethingnew.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={t('newsletter')}
            >
              <Newspaper className="h-4 w-4" />
            </a>
            <a
              href="https://discord.gg/uc2eNKVF3V"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              {t('discordJoin')}
            </a>
          </div>
        </div>

        {/* Bottom — copyright + disclaimer */}
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-center text-[11px] leading-relaxed text-white/30">
            {t('copyright', { year: new Date().getFullYear() })}
            {' · '}
            {t('legalDisclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
