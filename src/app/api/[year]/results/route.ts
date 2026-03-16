import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { rankScores } from '@/lib/utils/scoring'
import { isMock, getMockResults, MOCK_YEARS } from '@/lib/mock'
import type { ApiResponse, RankedScore } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/[year]/results
// Returns the leaderboard for the given year, sorted by PRD §7 tiebreaker rules.
// Only available when game state is 'results'.

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  if (isMock()) {
    // To preview results screen: temporarily set MOCK_YEARS[0].state = 'results' in mock.ts
    const year = parseInt(params.year, 10)
    const mockYear = MOCK_YEARS.find((y) => y.year === year) ?? MOCK_YEARS[0]
    if (mockYear.state !== 'results') {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Results are not yet available' },
        { status: 403 }
      )
    }
    return NextResponse.json<ApiResponse<RankedScore[]>>({
      data: getMockResults(year) as RankedScore[],
      error: null,
    })
  }
  try {
    const year = parseInt(params.year, 10)
    if (isNaN(year)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Invalid year' },
        { status: 400 }
      )
    }

    const { data: yearRecord, error: yearError } = await supabase
      .from('years')
      .select('id, state')
      .eq('year', year)
      .single()

    if (yearError || !yearRecord) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found' },
        { status: 404 }
      )
    }

    if (yearRecord.state !== 'results') {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Results are not yet available' },
        { status: 403 }
      )
    }

    // Fetch scores separately to avoid PostgREST join caching
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('user_id, score, heart_correct')
      .eq('year_id', yearRecord.id)

    if (scoresError) throw scoresError

    const userIds = (scores ?? []).map((s: { user_id: string }) => s.user_id)

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, avatar_color')
      .in('id', userIds)

    if (usersError) throw usersError

    // Count total categories for accuracy calculation
    const { count: totalCategories } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('year_id', yearRecord.id)

    const scoreResults = (scores ?? []).map((s: { user_id: string; score: number; heart_correct: number }) => ({
      user_id: s.user_id,
      score: s.score,
      heart_correct: s.heart_correct,
    }))

    const ranked = rankScores(scoreResults, users, totalCategories ?? 0)

    return NextResponse.json<ApiResponse<RankedScore[]>>(
      { data: ranked, error: null },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (err) {
    console.error('[GET /api/[year]/results]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
