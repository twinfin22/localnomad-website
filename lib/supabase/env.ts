/**
 * Centralized Supabase environment variable access.
 * All Supabase clients import from here instead of reading process.env directly.
 *
 * IMPORTANT: NEXT_PUBLIC_* vars must be accessed as literal `process.env.NEXT_PUBLIC_FOO`
 * so Next.js/Turbopack can inline them at build time. Dynamic access (process.env[name])
 * will always be undefined on the client.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. ' +
    'Check your .env.local file or Vercel environment settings.'
  );
}
if (!key) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Check your .env.local file or Vercel environment settings.'
  );
}

export const supabaseUrl: string = url;
export const supabaseAnonKey: string = key;

// TODO (B5): Verify Supavisor pooler is enabled in Supabase Dashboard → Settings → Database.
// Gen should confirm the connection string uses port 6543 (Supavisor) not 5432 (direct).
