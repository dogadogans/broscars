// Public anon-key Supabase client.
// In MVP, all data access goes through Next.js API routes (/api/**) — not this client.
// This file exists for future use (e.g. real-time subscriptions in V2).
// Do NOT call this from components for data fetching. Use fetch('/api/...') instead.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
