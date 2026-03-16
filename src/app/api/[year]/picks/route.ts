import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { resolveUserFromToken } from '@/lib/utils/token'
import { isMock, getMockPicks } from '@/lib/mock'
import type { ApiResponse, LocalPick, PickWithDetails } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/[year]/picks
// Returns all submitted picks for the year (for the group wall).
// No auth required — public read.

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  if (isMock()) {
    const year = parseInt(params.year, 10)
    return NextResponse.json<ApiResponse<PickWithDetails[]>>({
      data: getMockPicks(year) as unknown as PickWithDetails[],
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
      .select('id')
      .eq('year', year)
      .single()

    if (yearError || !yearRecord) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found' },
        { status: 404 }
      )
    }

    const { data: picks, error } = await supabase
      .from('picks')
      .select(`
        *,
        user:users(id, display_name, avatar_color),
        category:categories(id, name, name_tr),
        head_nominee:nominees!head_nominee_id(id, name, film_title),
        heart_nominee:nominees!heart_nominee_id(id, name, film_title)
      `)
      .eq('year_id', yearRecord.id)
      .not('submitted_at', 'is', null)

    if (error) throw error

    // eslint-disable-next-line -- supabase join type
    const shaped: PickWithDetails[] = (picks ?? []).map((row: any) => ({
      pick: {
        id: row.id,
        user_id: row.user_id,
        year_id: row.year_id,
        category_id: row.category_id,
        head_nominee_id: row.head_nominee_id,
        heart_nominee_id: row.heart_nominee_id,
        note: row.note,
        submitted_at: row.submitted_at,
      },
      user: row.user,
      category: row.category,
      head_nominee: row.head_nominee,
      heart_nominee: row.heart_nominee ?? null,
    }))

    return NextResponse.json<ApiResponse<PickWithDetails[]>>(
      { data: shaped, error: null }
    )
  } catch (err) {
    console.error('[GET /api/[year]/picks]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/[year]/picks
// Body: { picks: LocalPick[] }
// Header: x-device-token: <token>
// Upserts picks for the authenticated user and marks them submitted.

export async function POST(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  if (isMock()) {
    const body = await req.json()
    return NextResponse.json<ApiResponse<{ submitted: number }>>({
      data: { submitted: (body.picks ?? []).length },
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

    const token = req.headers.get('x-device-token')
    const user = await resolveUserFromToken(token)
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
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

    if (yearRecord.state !== 'voting') {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Voting is not open' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const picks: LocalPick[] = body.picks ?? []

    const now = new Date().toISOString()
    // Filter out unanswered picks — head_nominee_id is NOT NULL in the DB
    const rows = picks
      .filter((p) => p.head_nominee_id)
      .map((p) => ({
        user_id: user.id,
        year_id: yearRecord.id,
        category_id: p.category_id,
        head_nominee_id: p.head_nominee_id!,
        heart_nominee_id: p.heart_nominee_id ?? null,
        note: p.note || null,
        submitted_at: now,
      }))

    const { error } = await supabase
      .from('picks')
      .upsert(rows, { onConflict: 'user_id,year_id,category_id' })

    if (error) throw error

    return NextResponse.json<ApiResponse<{ submitted: number }>>(
      { data: { submitted: rows.length }, error: null }
    )
  } catch (err) {
    console.error('[POST /api/[year]/picks]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
