import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const DEFAULT_REDIRECT = '/en/korea/visa/dashboard';

/**
 * Validates the `next` query parameter to prevent open redirect attacks.
 * Only allows relative paths that start with `/` and do not contain `//`
 * (which could be interpreted as a protocol-relative URL like `//evil.com`).
 */
function sanitizeRedirect(next: string | null): string {
  if (!next) return DEFAULT_REDIRECT;

  // Must start with a single slash (relative path only)
  if (!next.startsWith('/')) return DEFAULT_REDIRECT;

  // Block protocol-relative URLs and double-slash patterns (e.g. //evil.com)
  if (next.includes('//')) return DEFAULT_REDIRECT;

  // Block backslash tricks (some browsers normalize \ to /)
  if (next.includes('\\')) return DEFAULT_REDIRECT;

  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirect(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
