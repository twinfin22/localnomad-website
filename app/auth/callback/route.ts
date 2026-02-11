import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const DEFAULT_REDIRECT = '/en/korea/visa/dashboard';

/**
 * Locale prefix pattern: must start with /{lang}/{country}/
 * e.g. /en/korea/visa/dashboard, /ko/korea/visa/checklist
 */
const LOCALE_PREFIX_RE = /^\/[a-z]{2}\/[a-z]+\//;

/**
 * Validates the `next` query parameter to prevent open redirect attacks.
 * Only allows relative paths that:
 *  1. Start with `/` (relative path only)
 *  2. Do NOT contain `//` (blocks protocol-relative URLs like `//evil.com`)
 *  3. Do NOT contain `\` (blocks backslash normalization tricks)
 *  4. Include a valid locale prefix `/{lang}/{country}/`
 */
function sanitizeRedirect(next: string | null): string {
  if (!next) return DEFAULT_REDIRECT;

  // Must start with a single slash (relative path only)
  if (!next.startsWith('/')) return DEFAULT_REDIRECT;

  // Block protocol-relative URLs and double-slash patterns (e.g. //evil.com)
  if (next.includes('//')) return DEFAULT_REDIRECT;

  // Block backslash tricks (some browsers normalize \ to /)
  if (next.includes('\\')) return DEFAULT_REDIRECT;

  // Must include locale prefix /{lang}/{country}/
  if (!LOCALE_PREFIX_RE.test(next)) return DEFAULT_REDIRECT;

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
