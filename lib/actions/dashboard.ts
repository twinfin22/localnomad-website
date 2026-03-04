'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from './auth';
import type { Profile, UserVisa, ChecklistItem } from '@/lib/types/dashboard';

// =============================================================================
// Profile
// =============================================================================

export const getProfile = async (): Promise<Profile | null> => {
  const user = await getSession();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('[getProfile] Failed to fetch profile:', error.message, { userId: user.id });
    return null;
  }
  return data as Profile;
};

export const updateProfile = async (
  updates: Partial<Pick<Profile, 'display_name' | 'preferred_locale'>>
): Promise<Profile | null> => {
  const user = await getSession();
  if (!user) throw new Error('Unauthenticated');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw new Error('Failed to update profile', { cause: error });
  revalidatePath('/dashboard');
  return data as Profile;
};

// =============================================================================
// User Visa
// =============================================================================

export const getActiveVisa = async (): Promise<UserVisa | null> => {
  const user = await getSession();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_visas')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('[getActiveVisa] Failed to fetch active visa:', error.message, { userId: user.id });
    return null;
  }
  return data as UserVisa | null;
};

export const createVisa = async (input: {
  country: 'kr' | 'tw';
  visa_type: string;
  expiry_date: string | null;
}): Promise<UserVisa> => {
  const user = await getSession();
  if (!user) throw new Error('Unauthenticated');

  const supabase = await createClient();

  // Deactivate any existing active visa
  await supabase
    .from('user_visas')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true);

  const { data, error } = await supabase
    .from('user_visas')
    .insert({
      user_id: user.id,
      country: input.country,
      visa_type: input.visa_type,
      expiry_date: input.expiry_date,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error('Failed to create visa', { cause: error });
  revalidatePath('/dashboard');
  return data as UserVisa;
};

export const updateVisa = async (
  visaId: string,
  updates: Partial<Pick<UserVisa, 'expiry_date' | 'is_active'>>
): Promise<UserVisa> => {
  const user = await getSession();
  if (!user) throw new Error('Unauthenticated');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_visas')
    .update(updates)
    .eq('id', visaId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error('Failed to update visa', { cause: error });
  revalidatePath('/dashboard');
  return data as UserVisa;
};

// =============================================================================
// Checklist
// =============================================================================

export const getChecklist = async (
  userVisaId: string
): Promise<ChecklistItem[]> => {
  const user = await getSession();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('user_visa_id', userVisaId);

  if (error) {
    console.error('[getChecklist] Failed to fetch checklist:', error.message, { userVisaId });
    return [];
  }
  return data as ChecklistItem[];
};

export const toggleChecklistItem = async (
  userVisaId: string,
  documentId: string,
  checked: boolean
): Promise<ChecklistItem> => {
  const user = await getSession();
  if (!user) throw new Error('Unauthenticated');

  const supabase = await createClient();

  // UPSERT: insert or update the checklist item
  const { data, error } = await supabase
    .from('checklist_items')
    .upsert(
      {
        user_visa_id: userVisaId,
        document_id: documentId,
        checked,
        checked_at: checked ? new Date().toISOString() : null,
      },
      { onConflict: 'user_visa_id,document_id' }
    )
    .select()
    .single();

  if (error)
    throw new Error('Failed to toggle checklist item', { cause: error });
  return data as ChecklistItem;
};
