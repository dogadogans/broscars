'use client'

import { useEffect, useState } from 'react'

const TOKEN_KEY = 'broscar_token'

/**
 * Reads or creates the device token from localStorage.
 * Safe for SSR — returns null until hydrated on the client.
 * The token is the user's persistent identity across sessions on this device.
 */
export function useDeviceToken(): { token: string | null } {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) {
      stored = crypto.randomUUID()
      localStorage.setItem(TOKEN_KEY, stored)
    }
    setToken(stored)
  }, [])

  return { token }
}
