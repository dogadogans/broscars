import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type * as Models from '@/types'
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
    if (mockYear.state !== 'results' && mockYear.state !== 'offseason') {
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

    const { data: yearRecord, error: yearError } = await db.one<Models.Year>(`SELECT id, state FROM "years" WHERE "year" = $1`, [year])

    if (yearError || !yearRecord) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found' },
        { status: 404 }
      )
    }

    if (yearRecord.state !== 'results' && yearRecord.state !== 'offseason') {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Results are not yet available' },
        { status: 403 }
      )
    }

    // Load scores and public player details for ranking.
    const { data: scores, error: scoresError } = await db.many<Models.Score>(`SELECT user_id, score, heart_correct FROM "scores" WHERE "year_id" = $1`, [yearRecord.id])

    if (scoresError) throw scoresError

    const userIds = (scores ?? []).map((s: { user_id: string }) => s.user_id)

    const { data: users, error: usersError } = await db.many<Models.User>(`SELECT id, display_name, avatar_color FROM "users" WHERE "id" = ANY($1)`, [userIds])

    if (usersError) throw usersError

    // Count total categories for accuracy calculation
    const { count: totalCategories } = await db.count(`SELECT count(*)::int AS count FROM "categories" WHERE "year_id" = $1`, [yearRecord.id])

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
