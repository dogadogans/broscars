// Server-side utility — import only in API route files.
import { db } from '@/lib/db'
import type * as Models from '@/types'
import type { User } from '@/types'

/**
 * Resolves a device token (from the x-device-token request header) to a User record.
 * Returns null if the token is missing or not found.
 */
export async function resolveUserFromToken(token: string | null): Promise<User | null> {
  if (!token) return null

  const { data, error } = await db.one<Models.User>("SELECT * FROM \"users\" WHERE \"token\" = $1", [token])

  if (error || !data) return null
  return data as User
}
