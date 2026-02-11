import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return null if env vars aren't configured (dev without Supabase)
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[Supabase] Missing environment variables. Auth features disabled.'
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return null as any;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};
