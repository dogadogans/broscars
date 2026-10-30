import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type * as Models from '@/types'
import type { ApiResponse } from '@/types'

// GET /api/[year]/participants
// Returns the count of users who have joined this year.
// No auth required — public read.

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
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

    const { count, error } = await db.count(`SELECT count(*)::int AS count FROM "year_participants" WHERE "year_id" = $1`, [yearRecord.id])

    if (error) throw error

    return NextResponse.json<ApiResponse<{ count: number }>>(
      { data: { count: count ?? 0 }, error: null }
    )
  } catch (err) {
    console.error('[GET /api/[year]/participants]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
