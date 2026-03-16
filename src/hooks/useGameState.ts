'use client'

import { useEffect, useState } from 'react'
import type { GameState } from '@/types'

interface UseGameStateResult {
  state: GameState | null
  loading: boolean
  error: string | null
}

/**
 * Fetches the current game state for a given year.
 * Returns { state, loading, error }.
 */
export function useGameState(year: number): UseGameStateResult {
  const [state, setState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchState() {
      try {
        const res = await fetch(`/api/${year}/state`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch game state')
        const json = await res.json()
        if (!cancelled) setState(json.data?.state ?? null)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchState()
    return () => { cancelled = true }
  }, [year])

  return { state, loading, error }
}
