import { NextRequest, NextResponse } from 'next/server'
import { db, type PickRow } from '@/lib/db'
import type * as Models from '@/types'
import { resolveUserFromToken } from '@/lib/utils/token'
import type { ApiResponse, PickWithDetails } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/[year]/my-picks
// Returns submitted picks for the authenticated user.
// Requires x-device-token header.

export async function GET(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  const year = parseInt(params.year, 10)
  if (isNaN(year)) {
    return NextResponse.json<ApiResponse<{ picks: PickWithDetails[]; submitted_count: number }>>(
      { data: { picks: [], submitted_count: 0 }, error: null }
    )
  }

  const token = req.headers.get('x-device-token')
  const user = await resolveUserFromToken(token)
  if (!user) {
    return NextResponse.json<ApiResponse<{ picks: PickWithDetails[]; submitted_count: number }>>(
      { data: { picks: [], submitted_count: 0 }, error: null }
    )
  }

  const { data: yearRecord } = await db.one<Models.Year>(`SELECT id FROM "years" WHERE "year" = $1`, [year])

  if (!yearRecord) {
    return NextResponse.json<ApiResponse<{ picks: PickWithDetails[]; submitted_count: number }>>(
      { data: { picks: [], submitted_count: 0 }, error: null }
    )
  }

  const { data: rows, error } = await db.many<PickRow>(`SELECT p.*, json_build_object('id', u.id, 'display_name', u.display_name, 'avatar_color', u.avatar_color) AS "user", json_build_object('id', c.id, 'name', c.name, 'name_tr', c.name_tr) AS category, json_build_object('id', h.id, 'name', h.name, 'film_title', h.film_title) AS head_nominee, CASE WHEN heart.id IS NULL THEN NULL ELSE json_build_object('id', heart.id, 'name', heart.name, 'film_title', heart.film_title) END AS heart_nominee FROM picks p JOIN users u ON u.id = p.user_id JOIN categories c ON c.id = p.category_id JOIN nominees h ON h.id = p.head_nominee_id LEFT JOIN nominees heart ON heart.id = p.heart_nominee_id WHERE p."user_id" = $1 AND p."year_id" = $2 AND p."submitted_at" IS NOT NULL`, [user.id, yearRecord.id])

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
  const picks: PickWithDetails[] = (rows ?? []).map((row) => ({
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

  return NextResponse.json<ApiResponse<{ picks: PickWithDetails[]; submitted_count: number }>>(
    { data: { picks, submitted_count: picks.length }, error: null }
  )
}
