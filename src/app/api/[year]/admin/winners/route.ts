import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type * as Models from '@/types'
import { calculateScores } from '@/lib/utils/scoring'
import type { ApiResponse, UserPick, User } from '@/types'

function validateAdminPassword(req: NextRequest): boolean {
  return (req.headers.get('x-admin-password') ?? '') === process.env.ADMIN_PASSWORD
}

// POST /api/[year]/admin/winners
// Header: x-admin-password
// Body: { winners: [{ nominee_id: string }] }
// 1. Sets nominees.is_winner = true for each winning nominee_id.
// 2. Calculates scores for all users who submitted picks.
// 3. Upserts into scores table.

export async function POST(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  if (!validateAdminPassword(req)) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const year = parseInt(params.year, 10)
    if (isNaN(year)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Invalid year' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const winners: { nominee_id: string }[] = body.winners ?? []
    const winnerIds = winners.map((w) => w.nominee_id)

    const { data: yearRecord, error: yearError } = await db.one<Models.Year>(`SELECT id FROM "years" WHERE "year" = $1`, [year])

    if (yearError || !yearRecord) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found' },
        { status: 404 }
      )
    }

    // Reset all nominees for this year to is_winner = false
    const { data: categoryIds } = await db.many<Models.Category>(`SELECT id FROM "categories" WHERE "year_id" = $1`, [yearRecord.id])

    if (categoryIds && categoryIds.length > 0) {
      await db.many<Models.Nominee>(`UPDATE "nominees" SET "is_winner" = $1 WHERE "category_id" = ANY($2) RETURNING *`, [false, categoryIds.map((c: { id: string }) => c.id)])
    }

    // Set winners
    if (winnerIds.length > 0) {
      const { error: winnerError } = await db.many<Models.Nominee>(`UPDATE "nominees" SET "is_winner" = $1 WHERE "id" = ANY($2) RETURNING *`, [true, winnerIds])

      if (winnerError) throw winnerError
    }

    // Fetch all submitted picks for the year
    const { data: picks, error: picksError } = await db.many<Models.UserPick>(`SELECT * FROM "picks" WHERE "year_id" = $1 AND "submitted_at" IS NOT NULL`, [yearRecord.id])

    if (picksError) throw picksError

    // Fetch all users who have picks
    const userIds = [...new Set((picks ?? []).map((p: UserPick) => p.user_id))]
    const { data: users, error: usersError } = await db.many<Models.User>(`SELECT id, display_name, avatar_color FROM "users" WHERE "id" = ANY($1)`, [userIds])

    if (usersError) throw usersError

    // Fetch actual is_winner nominees from DB (authoritative source, not just submitted IDs)
    const { data: dbWinners } = await db.many<Models.Nominee>(`SELECT id FROM "nominees" WHERE "is_winner" = $1 AND "category_id" = ANY($2)`, [true, (categoryIds ?? []).map((c: { id: string }) => c.id)])

    const winnerIdSet = new Set([...(dbWinners ?? []).map((n: { id: string }) => n.id)])
    console.log('[winners] submitted:', winnerIds.length, 'db_winners:', winnerIdSet.size, 'picks:', (picks ?? []).length)
    const scoreResults = calculateScores(picks as UserPick[], winnerIdSet)
    console.log('[winners] scores:', scoreResults.map(s => `${s.user_id.slice(0,8)}:${s.score}`))

    // Upsert scores
    const scoreRows = scoreResults.map((s) => ({
      user_id: s.user_id,
      year_id: yearRecord.id,
      score: s.score,
      heart_correct: s.heart_correct,
      calculated_at: new Date().toISOString(),
    }))

    const { error: scoresError } = await db.write("scores", scoreRows, "user_id,year_id", false)

    if (scoresError) throw scoresError

    return NextResponse.json<ApiResponse<{ scores_calculated: number }>>(
      { data: { scores_calculated: scoreRows.length }, error: null }
    )
  } catch (err) {
    console.error('[POST /api/[year]/admin/winners]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
