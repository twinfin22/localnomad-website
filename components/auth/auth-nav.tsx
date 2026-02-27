'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function AuthNav() {
  const t = useTranslations('Auth');
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoaded(true);
    }).catch(() => {
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  if (user) {
    return (
      <>
        <Link href="/dashboard" className="text-primary hover:underline">
          {t('dashboard')}
        </Link>
        <form
          action={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
        >
          <button
            type="submit"
            className="text-muted-foreground hover:underline"
          >
            {t('logOut')}
          </button>
        </form>
      </>
    );
  }

  return (
    <Link href="/login" className="text-primary hover:underline">
      {t('logIn')}
    </Link>
  );
}
