import { createClient } from '@supabase/supabase-js';

export function cleanSupabaseUrl(url: string): string {
  let cleaned = (url || '').trim();
  if (!cleaned) return '';

  // Prepend https:// if it has no protocol
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    // If they copied something like https://project.supabase.co/rest/v1 we only want the origin
    return `${parsed.protocol}//${parsed.host}`;
  } catch (error) {
    // Fallback if URL is totally weird: just strip trailing slashes
    return cleaned.replace(/\/+$/, '');
  }
}

// Retrieve credentials from environment variables or custom localStorage inputs
export function getSupabaseCredentials() {
  const fallbackUrl = 'https://hvgkibbyqqreytwtcwwx.supabase.co';
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Z2tpYmJ5cXFyZXl0d3Rjd3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDYyMDksImV4cCI6MjA5NzI4MjIwOX0.dEDuqe1jGK4NHJ0c-grO5s6JRvkWQLth4qgZkr2ahI0';

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem('cams_supabase_url');
  const localKey = localStorage.getItem('cams_supabase_anon_key');

  // Prioritize environment configuration defined by secrets over local storage or fallback defaults.
  // This immediately connects laptops and helper mobile scanners on the same active cloud project.
  const url = cleanSupabaseUrl(envUrl || localUrl || fallbackUrl);
  const key = (envKey || localKey || fallbackKey).trim();

  return { url, key };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return !!(url && key && (url.startsWith('http://') || url.startsWith('https://')));
}

// Dynamic initialization of Supabase client to support changing credentials at runtime
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getSupabaseCredentials();
  if (!url || !key || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

// Reset instance to allow re-creating after changing credentials in Settings
export function resetSupabaseClient() {
  supabaseInstance = null;
}
