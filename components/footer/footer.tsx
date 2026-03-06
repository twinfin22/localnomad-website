import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Instagram, Newspaper } from 'lucide-react';

export async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="border-t bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Brand */}
        <div className="text-center">
          <span className="font-lora text-2xl font-bold text-primary">
            LocalNomad
          </span>
        </div>

        {/* Discord CTA */}
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/[0.04] px-6 py-5 text-center">
          <p className="font-lora text-lg font-bold text-primary">
            {t('discordCta')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('discordCtaSub')}
          </p>
          <a
            href="https://discord.gg/uc2eNKVF3V"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            {t('discordJoin')}
          </a>
        </div>

        {/* Social links */}
        <div className="mt-8 flex justify-center gap-6">
          <a
            href="https://www.instagram.com/localnomad.club/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:text-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            aria-label={t('instagram')}
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://startofsomethingnew.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:text-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            aria-label={t('newsletter')}
          >
            <Newspaper className="h-5 w-5" />
          </a>
          <a
            href="https://discord.gg/uc2eNKVF3V"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:text-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            aria-label={t('discord')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
          </a>
        </div>

        {/* Legal links + copyright */}
        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('copyright', { year: new Date().getFullYear() })}
            {' · '}
            <Link href="/terms" className="hover:text-foreground transition-colors focus-visible:text-foreground focus-visible:underline outline-none">
              {t('terms')}
            </Link>
            {' · '}
            <Link href="/privacy" className="hover:text-foreground transition-colors focus-visible:text-foreground focus-visible:underline outline-none">
              {t('privacy')}
            </Link>
            {' · '}
            <Link href="/refund" className="hover:text-foreground transition-colors focus-visible:text-foreground focus-visible:underline outline-none">
              {t('refund')}
            </Link>
            {' · '}
            <Link href="/about" className="hover:text-foreground transition-colors focus-visible:text-foreground focus-visible:underline outline-none">
              {t('about')}
            </Link>
            {' · '}
            <Link href="/contact" className="hover:text-foreground transition-colors focus-visible:text-foreground focus-visible:underline outline-none">
              {t('contact')}
            </Link>
          </p>
        </div>

        {/* Legal disclaimer */}
        <div className="mt-6 border-t border-border/50 pt-4 text-center">
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-muted-foreground/60">
            {t('legalDisclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
