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
