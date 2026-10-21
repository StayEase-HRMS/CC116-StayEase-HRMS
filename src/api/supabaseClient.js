import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[StayEase] Missing Supabase environment variables. Using offline / demo mode. ' +
    'To connect your live database, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file.'
  )
}

// Resilient client instance: connects to live Supabase URL and anon key when configured
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : createClient('https://placeholder-project.supabase.co', 'placeholder-anon-key')
