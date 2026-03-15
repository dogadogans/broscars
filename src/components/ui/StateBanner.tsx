'use client'

import { useTranslation } from '@/hooks/useTranslation'
import type { GameState } from '@/types'

interface StateBannerProps {
  state: GameState
  year: number
}

const stateStyles: Record<GameState, string> = {
  voting: 'bg-emerald-900/50 border-emerald-500/30 text-emerald-300',
  results: 'bg-gold-900/50 border-gold-500/30 text-gold-300',
  offseason: 'bg-white/5 border-white/10 text-white/50',
}

const stateIcons: Record<GameState, string> = {
  voting: '🟢',
  results: '🏆',
  offseason: '💤',
}

export default function StateBanner({ state, year }: StateBannerProps) {
  const { t } = useTranslation()

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${stateStyles[state]}`}>
      {stateIcons[state]}{' '}
      <span>{t(`states.${state}`)}</span>
      {' — '}
      <span>{year} Oscars</span>
    </div>
  )
}
