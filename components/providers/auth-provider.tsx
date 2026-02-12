'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Only create Supabase client on client side
  const supabase = useMemo<SupabaseClient<Database> | null>(() => {
    if (typeof window === 'undefined') return null;
    return createClient();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Migrate localStorage data on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        await migrateLocalStorageToSupabase(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const migrateLocalStorageToSupabase = async (userId: string) => {
    // Check for existing localStorage data
    const localProgress = localStorage.getItem('visa-progress');
    if (!localProgress || !supabase) return;

    try {
      const progress = JSON.parse(localProgress);

      // Check if user already has data in Supabase
      const { data: existingProgress } = await supabase
        .from('visa_progress')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProgress) {
        // User already has data, clear localStorage
        clearLocalStorage();
        return;
      }

      // Migrate progress data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @supabase/ssr generic inference resolves to never; Database types are correct
      await (supabase.from('visa_progress') as any).insert({
        user_id: userId,
        visa_type: progress.visaType,
        state: progress.state || 'PREPARING',
        target_date: progress.targetDate,
        submitted_date: progress.submittedDate,
        approved_date: progress.approvedDate,
        entry_date: progress.entryDate,
        expiry_date: progress.expiryDate,
        notes: progress.notes,
      });

      // Migrate checklist items
      const checklistKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith('visa-checklist-')
      );

      for (const key of checklistKeys) {
        const visaType = key.replace('visa-checklist-', '');
        const checklist = JSON.parse(localStorage.getItem(key) || '{}');

        const items = Object.entries(checklist)
          .filter(([, completed]) => completed)
          .map(([docId]) => ({
            user_id: userId,
            visa_type: visaType,
            document_id: docId,
            completed: true,
            completed_at: new Date().toISOString(),
          }));

        if (items.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @supabase/ssr generic inference resolves to never
          await (supabase.from('checklist_items') as any).insert(items);
        }
      }

      clearLocalStorage();
    } catch (error: unknown) {
      console.error('Error migrating localStorage data:', error instanceof Error ? error.message : String(error));
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('visa-progress');
    const checklistKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith('visa-checklist-')
    );
    checklistKeys.forEach((key) => localStorage.removeItem(key));
  };

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error('Supabase not initialized') };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error('Supabase not initialized') };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
