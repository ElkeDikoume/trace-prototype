// Supabase client for the v2 shell. Reads config from Vite env
// (.env.local: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY — the anon key is a
// browser-public key by design). If either is missing we export null so the
// rest of the app can gracefully fall back to demo/offline behaviour instead
// of crashing.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Convenience: the currently authenticated Supabase user's id (auth.uid()), or
// null when running as a demo/guest user with no real session.
export async function getCurrentUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}
