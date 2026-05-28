/** ============================================================
 *  SUPABASE CLIENT — Cloud Persistence for Solo Leveling System
 *  ============================================================
 *  Offline-first architecture:
 *  1. Reads from localStorage instantly (no latency)
 *  2. Syncs to Supabase in background
 *  3. On app load, pulls latest cloud state if newer than local
 *  4. Falls back to localStorage if Supabase is unavailable
 *  ============================================================ */

import { createClient } from '@supabase/supabase-js';

const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Pre-embedded credentials (base64) — solo-leveling-system project
const DEFAULT_SUPABASE_URL_B64 = 'aHR0cHM6Ly9neGNoZGV1dXVkcGxxa3Zwd2lqaC5zdXBhYmFzZS5jbw==';
const DEFAULT_SUPABASE_KEY_B64 = 'c2JfcHVibGlzaGFibGVfWXFCX1lXUm9VdUJQWW5HSlJnaUhSQV9sckViTlNkTg==';

function getDefaultUrl() {
  try { return DEFAULT_SUPABASE_URL_B64 ? atob(DEFAULT_SUPABASE_URL_B64) : ''; } catch { return ''; }
}
function getDefaultKey() {
  try { return DEFAULT_SUPABASE_KEY_B64 ? atob(DEFAULT_SUPABASE_KEY_B64) : ''; } catch { return ''; }
}

const LS_URL_KEY = 'supabase_url';
const LS_ANON_KEY = 'supabase_anon_key';

let supabase = null;

function getStoredUrl() {
  try { return localStorage.getItem(LS_URL_KEY) || ''; } catch { return ''; }
}

function getStoredKey() {
  try { return localStorage.getItem(LS_ANON_KEY) || ''; } catch { return ''; }
}

export function getSupabaseUrl() {
  return ENV_URL || getStoredUrl() || getDefaultUrl();
}

export function getSupabaseAnonKey() {
  return ENV_KEY || getStoredKey() || getDefaultKey();
}

export function initSupabase(url, key) {
  if (!url || !key) return null;
  supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return supabase;
}

export function getSupabase() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!supabase && url && key) {
    supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabase;
}

export function isSupabaseConfigured() {
  return !!(getSupabaseUrl() && getSupabaseAnonKey());
}

export function setSupabaseCredentials(url, key) {
  if (url) localStorage.setItem(LS_URL_KEY, url);
  else localStorage.removeItem(LS_URL_KEY);
  if (key) localStorage.setItem(LS_ANON_KEY, key);
  else localStorage.removeItem(LS_ANON_KEY);
  // Re-init client if credentials changed
  supabase = null;
  return getSupabase();
}

export { supabase };
