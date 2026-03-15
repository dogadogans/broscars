// IMPORTANT: This file is the ONLY authorized Supabase access point in the app.
// It uses the SERVICE ROLE key which bypasses Row Level Security.
// Import this file ONLY in API route files (src/app/api/**).
// Never import this in components, pages, or client-side hooks.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Check .env.local.')
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _client
}

// Proxy so call sites use `supabase.from(...)` without knowing about lazy init.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
