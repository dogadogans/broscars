import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { rankScores } from '@/lib/utils/scoring'
import { isMock, getMockResults, MOCK_YEARS } from '@/lib/mock'
import type { ApiResponse, RankedScore } from '@/types'

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

    // Fetch scores joined with users
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('*, users(id, display_name, avatar_color)')
      .eq('year_id', yearRecord.id)

    if (scoresError) throw scoresError

    // Count total categories for accuracy calculation
    const { count: totalCategories } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('year_id', yearRecord.id)

    const scoreResults = (scores ?? []).map((s: Record<string, unknown>) => ({
      user_id: (s.users as { id: string }).id,
      score: s.score as number,
      heart_correct: s.heart_correct as number,
    }))
    const users = (scores ?? []).map((s: Record<string, unknown>) =>
      s.users as { id: string; display_name: string; avatar_color: string }
    )

    const ranked = rankScores(scoreResults, users, totalCategories ?? 0)

    return NextResponse.json<ApiResponse<RankedScore[]>>(
      { data: ranked, error: null }
    )
  } catch (err) {
    console.error('[GET /api/[year]/results]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
