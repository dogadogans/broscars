import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import type { ApiResponse, AllTimeRankedScore } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/all-time
// Returns aggregated scores across all years with state 'results', ranked by total score.

export async function GET() {
  try {
    const { data: resultYears, error: yearsError } = await supabase
      .from('years')
      .select('id')
      .eq('state', 'results')

    if (yearsError) throw yearsError

    if (!resultYears || resultYears.length === 0) {
      return NextResponse.json<ApiResponse<AllTimeRankedScore[]>>(
        { data: [], error: null },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      )
    }

    const yearIds = resultYears.map((y: { id: string }) => y.id)

    // Fetch scores separately to avoid PostgREST join caching
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('user_id, score, heart_correct')
      .in('year_id', yearIds)

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

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, avatar_color')
      .in('id', userIds)

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
