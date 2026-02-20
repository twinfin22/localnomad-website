import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Extract locale from the URL path: /en/auth/callback → 'en'
  const pathname = new URL(request.url).pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)\//);
  const locale = localeMatch ? localeMatch[1] : 'en';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has an active visa to decide redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: activeVisa } = await supabase
          .from('user_visas')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (activeVisa) {
          return NextResponse.redirect(
            new URL(`/${locale}/dashboard`, origin)
          );
        }

        return NextResponse.redirect(
          new URL(`/${locale}/onboarding`, origin)
        );
      }
    }
  }

  // If code exchange fails, redirect to login
  return NextResponse.redirect(new URL(`/${locale}/login`, origin));
}
