import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSession } from '@/lib/actions/auth';
import { LogoutButton } from './logout-button';

export async function AuthNav() {
  const [user, t] = await Promise.all([
    getSession(),
    getTranslations('Auth'),
  ]);

  if (user) {
    return (
      <>
        <Link href="/dashboard" className="text-primary hover:underline">
          {t('dashboard')}
        </Link>
        <LogoutButton label={t('logOut')} />
      </>
    );
  }

  return (
    <Link href="/login" className="text-primary hover:underline">
      {t('logIn')}
    </Link>
  );
}
