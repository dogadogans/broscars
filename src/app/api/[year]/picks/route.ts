import { NextRequest, NextResponse } from 'next/server'
import { db, type PickRow } from '@/lib/db'
import type * as Models from '@/types'
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

    const { data: yearRecord, error: yearError } = await db.one<Models.Year>(`SELECT id FROM "years" WHERE "year" = $1`, [year])

    if (yearError || !yearRecord) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found' },
        { status: 404 }
      )
    }

    const { data: picks, error } = await db.many<PickRow>(`SELECT p.*, json_build_object('id', u.id, 'display_name', u.display_name, 'avatar_color', u.avatar_color) AS "user", json_build_object('id', c.id, 'name', c.name, 'name_tr', c.name_tr) AS category, json_build_object('id', h.id, 'name', h.name, 'film_title', h.film_title) AS head_nominee, CASE WHEN heart.id IS NULL THEN NULL ELSE json_build_object('id', heart.id, 'name', heart.name, 'film_title', heart.film_title) END AS heart_nominee FROM picks p JOIN users u ON u.id = p.user_id JOIN categories c ON c.id = p.category_id JOIN nominees h ON h.id = p.head_nominee_id LEFT JOIN nominees heart ON heart.id = p.heart_nominee_id WHERE p."year_id" = $1 AND p."submitted_at" IS NOT NULL`, [yearRecord.id])

    if (error) throw error
    const shaped: PickWithDetails[] = (picks ?? []).map((row) => ({
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
      { data: shaped, error: null },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
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

    const { data: yearRecord, error: yearError } = await db.one<Models.Year>(`SELECT id, state FROM "years" WHERE "year" = $1`, [year])

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

    const { error } = await db.write("picks", rows, "user_id,year_id,category_id", false)

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
