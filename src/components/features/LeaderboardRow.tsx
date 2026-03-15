import Avatar from '@/components/ui/Avatar'
import type { RankedScore } from '@/types'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

interface LeaderboardRowProps {
  entry: RankedScore
}

export default function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const medal = MEDALS[entry.rank]

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-surface-subtle px-4 py-3">
      {/* Rank */}
      <div className="w-8 text-center text-lg font-bold">
        {medal ?? <span className="text-white/40">{entry.rank}</span>}
      </div>

      {/* Avatar + Name */}
      <Avatar
        displayName={entry.user.display_name}
        color={entry.user.avatar_color}
        size="md"
      />
      <p className="flex-1 font-semibold text-white">{entry.user.display_name}</p>

      {/* Stats */}
      <div className="text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <p className="text-lg font-bold text-gold-500">{entry.score}</p>
        <p className="text-xs text-white/40">{entry.accuracy}%</p>
      </div>
    </div>
  )
}
