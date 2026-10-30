import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type * as Models from '@/types'
import type { ApiResponse, AllTimeRankedScore } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/all-time
// Returns aggregated scores across all years with state 'results', ranked by total score.

export async function GET() {
  try {
    const { data: resultYears, error: yearsError } = await db.many<Models.Year>(`SELECT id FROM "years" WHERE "state" = $1`, ['results'])

    if (yearsError) throw yearsError

    if (!resultYears || resultYears.length === 0) {
      return NextResponse.json<ApiResponse<AllTimeRankedScore[]>>(
        { data: [], error: null },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      )
    }

    const yearIds = resultYears.map((y: { id: string }) => y.id)

    // Load scores and public player details for ranking.
    const { data: scores, error: scoresError } = await db.many<Models.Score>(`SELECT user_id, score, heart_correct FROM "scores" WHERE "year_id" = ANY($1)`, [yearIds])

    if (scoresError) throw scoresError

    // Aggregate by user across all years
    const aggregated = new Map<string, { total_score: number; heart_correct: number; years_participated: number }>()

    for (const s of scores ?? []) {
      if (!aggregated.has(s.user_id)) {
        aggregated.set(s.user_id, { total_score: 0, heart_correct: 0, years_participated: 0 })
      }
      const agg = aggregated.get(s.user_id)!
      agg.total_score += s.score
      agg.heart_correct += s.heart_correct
      agg.years_participated += 1
    }

    const userIds = [...aggregated.keys()]

    if (userIds.length === 0) {
      return NextResponse.json<ApiResponse<AllTimeRankedScore[]>>(
        { data: [], error: null },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      )
    }

    const { data: users, error: usersError } = await db.many<Models.User>(`SELECT id, display_name, avatar_color FROM "users" WHERE "id" = ANY($1)`, [userIds])

    if (usersError) throw usersError

    const userMap = new Map(
      (users ?? []).map((u: { id: string; display_name: string; avatar_color: string }) => [u.id, u])
    )

    const ranked: AllTimeRankedScore[] = [...aggregated.entries()]
      .filter(([userId]) => userMap.has(userId))
      .sort(([aId, a], [bId, b]) => {
        if (b.total_score !== a.total_score) return b.total_score - a.total_score
        if (b.heart_correct !== a.heart_correct) return b.heart_correct - a.heart_correct
        const nameA = userMap.get(aId)?.display_name ?? ''
        const nameB = userMap.get(bId)?.display_name ?? ''
        return nameA.localeCompare(nameB)
      })
      .map(([userId, agg], i) => ({
        rank: i + 1,
        user: userMap.get(userId)!,
        total_score: agg.total_score,
        heart_correct: agg.heart_correct,
        years_participated: agg.years_participated,
      }))

    return NextResponse.json<ApiResponse<AllTimeRankedScore[]>>(
      { data: ranked, error: null },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (err) {
    console.error('[GET /api/all-time]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
