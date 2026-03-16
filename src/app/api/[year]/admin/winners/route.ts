import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
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

    const { data: yearRecord, error: yearError } = await supabase
      .from('years')
      .select('id')
      .eq('year', year)
      .single()

    if (yearError || !yearRecord) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found' },
        { status: 404 }
      )
    }

    // Reset all nominees for this year to is_winner = false
    const { data: categoryIds } = await supabase
      .from('categories')
      .select('id')
      .eq('year_id', yearRecord.id)

    if (categoryIds && categoryIds.length > 0) {
      await supabase
        .from('nominees')
        .update({ is_winner: false })
        .in('category_id', categoryIds.map((c: { id: string }) => c.id))
    }

    // Set winners
    if (winnerIds.length > 0) {
      const { error: winnerError } = await supabase
        .from('nominees')
        .update({ is_winner: true })
        .in('id', winnerIds)

      if (winnerError) throw winnerError
    }

    // Fetch all submitted picks for the year
    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('*')
      .eq('year_id', yearRecord.id)
      .not('submitted_at', 'is', null)

    if (picksError) throw picksError

    // Fetch all users who have picks
    const userIds = [...new Set((picks ?? []).map((p: UserPick) => p.user_id))]
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, avatar_color')
      .in('id', userIds)

    if (usersError) throw usersError

    // Fetch actual is_winner nominees from DB (authoritative source, not just submitted IDs)
    const { data: dbWinners } = await supabase
      .from('nominees')
      .select('id')
      .eq('is_winner', true)
      .in('category_id', (categoryIds ?? []).map((c: { id: string }) => c.id))

    const winnerIdSet = new Set([...(dbWinners ?? []).map((n: { id: string }) => n.id)])
    const scoreResults = calculateScores(picks as UserPick[], winnerIdSet)

    // Upsert scores
    const scoreRows = scoreResults.map((s) => ({
      user_id: s.user_id,
      year_id: yearRecord.id,
      score: s.score,
      heart_correct: s.heart_correct,
      calculated_at: new Date().toISOString(),
    }))

    const { error: scoresError } = await supabase
      .from('scores')
      .upsert(scoreRows, { onConflict: 'user_id,year_id' })

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
