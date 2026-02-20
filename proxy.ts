import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_SEGMENTS = ['/dashboard', '/onboarding'];
const AUTH_SEGMENTS = ['/login'];

export default async function proxy(request: NextRequest) {
  // 1. Run next-intl middleware first for locale handling
  const intlResponse = intlMiddleware(request);
  const response = intlResponse || NextResponse.next();

  // 2. Refresh Supabase auth session (read/write cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Extract locale from path: /en/dashboard → locale = 'en'
  const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)\//);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  // Strip locale prefix to get the segment
  const pathWithoutLocale = localeMatch
    ? pathname.slice(localeMatch[0].length - 1)
    : pathname;

  // 3. Route protection
  const isProtectedRoute = PROTECTED_SEGMENTS.some((seg) =>
    pathWithoutLocale.startsWith(seg)
  );
  const isAuthRoute = AUTH_SEGMENTS.some((seg) =>
    pathWithoutLocale.startsWith(seg)
  );

  if (isProtectedRoute && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
