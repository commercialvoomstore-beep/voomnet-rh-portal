import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase Demo Config (or read from process.env / localStorage)
const getSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('VOOMNET_SUPABASE_URL');
    const customKey = localStorage.getItem('VOOMNET_SUPABASE_ANON_KEY');
    if (customUrl && customKey) {
      return { url: customUrl, key: customKey };
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';
  return { url, key };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  const { url, key } = getSupabaseCredentials();
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('VOOMNET_SUPABASE_URL');
    const customKey = localStorage.getItem('VOOMNET_SUPABASE_ANON_KEY');
    if (customUrl && customKey) return true;
  }
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xyzcompany')
  );
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('VOOMNET_SUPABASE_URL', url.trim());
    localStorage.setItem('VOOMNET_SUPABASE_ANON_KEY', key.trim());
    supabaseInstance = createClient(url.trim(), key.trim());
  }
};

export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('VOOMNET_SUPABASE_URL');
    localStorage.removeItem('VOOMNET_SUPABASE_ANON_KEY');
    supabaseInstance = null;
  }
};
