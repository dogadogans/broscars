import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type * as Models from '@/types'
import { isMock, MOCK_YEARS } from '@/lib/mock'
import type { ApiResponse, Year } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/years
// Returns all years ordered descending (newest first).

export async function GET() {
  if (isMock()) {
    return NextResponse.json<ApiResponse<Year[]>>({ data: MOCK_YEARS as Year[], error: null })
  }
  try {
    const { data, error } = await db.many<Models.Year>(`SELECT id, year, state, created_at FROM "years" ORDER BY "year" DESC`)

    if (error) throw error

    return NextResponse.json<ApiResponse<Year[]>>({ data: data as Year[], error: null })
  } catch (err) {
    console.error('[GET /api/years]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
