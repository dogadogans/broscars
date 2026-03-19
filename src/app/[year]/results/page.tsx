'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LeaderboardRow from '@/components/features/LeaderboardRow'
import { useGameState } from '@/hooks/useGameState'
import { useTranslation } from '@/hooks/useTranslation'
import type { RankedScore } from '@/types'

export default function ResultsPage() {
  const { year } = useParams()
  const yearNum = Number(year)
  const { state, loading: stateLoading } = useGameState(yearNum)
  const { t } = useTranslation()

  const [scores, setScores] = useState<RankedScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (state !== 'results' && state !== 'offseason' && state !== null) {
      setLoading(false)
      return
    }
    if (state === null) return // still loading state

    fetch(`/api/${year}/results`)
      .then((r) => r.json())
      .then((json) => setScores(json.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year, state])

  const winner = scores[0] ?? null

  if (stateLoading || loading) {
    return (
      <div className="px-4">
        <div className="mx-auto w-full max-w-[480px] py-16 text-white/40">
          {t('common.loading')}
        </div>
      </div>
    )
  }

  // Not results state — show a holding message
  if (state !== 'results' && state !== 'offseason') {
    return (
      <div className="px-4">
        <div className="mx-auto w-full max-w-[480px] py-16 text-center">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-white/50">{t('results.notAvailable')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4">
    <div className="mx-auto w-full max-w-[480px] pb-16 pt-8">
      <h1 className="mb-8 text-3xl font-bold text-white">{t('results.heading')}</h1>

      {/* Winner celebration */}
      {winner && (
        <div className="mb-8 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-6 text-center">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-gold-500">
            {t('results.winner')}
          </p>
          <p className="text-2xl font-bold text-white">{winner.user.display_name}</p>
          <p className="mt-1 text-gold-400">
            {winner.score} / {winner.total_categories} — {winner.accuracy}%
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-2">
        {scores.map((entry) => (
          <LeaderboardRow key={entry.user.id} entry={entry} />
        ))}
      </div>

      {scores.length === 0 && (
        <p className="text-center text-white/40">{t('results.notAvailable')}</p>
      )}
    </div>
    </div>
  )
}
