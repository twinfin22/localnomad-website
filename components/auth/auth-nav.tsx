'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useUser } from '@/hooks/use-user';
import { LogoutButton } from './logout-button';

export function AuthNav() {
  const { user, loading } = useUser();
  const t = useTranslations('Auth');

  return (
    <>
      <Link href="/dashboard" className="text-primary hover:underline">
        {t('dashboard')}
      </Link>
      {!loading && user && <LogoutButton label={t('logOut')} />}
    </>
  );
}
