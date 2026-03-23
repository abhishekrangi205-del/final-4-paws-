import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log connection status on first load (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[v0] Supabase URL configured:', !!supabaseUrl)
  console.log('[v0] Supabase Anon Key configured:', !!supabaseAnonKey)
}

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[v0] Supabase configuration missing:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey
    })
    return null
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}
