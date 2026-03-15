// Server-side utility — import only in API route files.
import { supabase } from '@/lib/supabase/server'
import type { User } from '@/types'

/**
 * Resolves a device token (from the x-device-token request header) to a User record.
 * Returns null if the token is missing or not found.
 */
export async function resolveUserFromToken(token: string | null): Promise<User | null> {
  if (!token) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) return null
  return data as User
}
