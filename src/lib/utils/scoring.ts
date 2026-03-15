import type { UserPick, RankedScore } from '@/types'

export interface ScoreResult {
  user_id: string
  score: number
  heart_correct: number
}

/**
 * Calculates per-user scores given all submitted picks and the set of winning nominee IDs.
 * 1 point per correct head pick. Heart correct count tracked for tiebreaking.
 */
export function calculateScores(
  picks: UserPick[],
  winnerNomineeIds: Set<string>
): ScoreResult[] {
  const scoreMap = new Map<string, ScoreResult>()

  for (const pick of picks) {
    if (!pick.submitted_at) continue // only count submitted picks

    if (!scoreMap.has(pick.user_id)) {
      scoreMap.set(pick.user_id, { user_id: pick.user_id, score: 0, heart_correct: 0 })
    }

    const result = scoreMap.get(pick.user_id)!

    if (winnerNomineeIds.has(pick.head_nominee_id)) {
      result.score += 1
    }

    if (pick.heart_nominee_id && winnerNomineeIds.has(pick.heart_nominee_id)) {
      result.heart_correct += 1
    }
  }

  return Array.from(scoreMap.values())
}

/**
 * Sorts and ranks scores per PRD §7 tiebreaker rules:
 * 1. Score descending
 * 2. heart_correct descending
 * 3. display_name alphabetical ascending
 */
export function rankScores(
  scores: ScoreResult[],
  users: { id: string; display_name: string; avatar_color: string }[],
  totalCategories: number
): RankedScore[] {
  const userMap = new Map(users.map((u) => [u.id, u]))

  const sorted = [...scores].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.heart_correct !== a.heart_correct) return b.heart_correct - a.heart_correct
    const nameA = userMap.get(a.user_id)?.display_name ?? ''
    const nameB = userMap.get(b.user_id)?.display_name ?? ''
    return nameA.localeCompare(nameB)
  })

  return sorted.map((s, i) => {
    const user = userMap.get(s.user_id)!
    return {
      rank: i + 1,
      user,
      score: s.score,
      heart_correct: s.heart_correct,
      accuracy: totalCategories > 0 ? Math.round((s.score / totalCategories) * 100) : 0,
      total_categories: totalCategories,
    }
  })
}
