import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { isMock, MOCK_YEARS } from '@/lib/mock'
import type { ApiResponse, GameState, Year } from '@/types'

// GET /api/[year]/state
// Returns the current game state for the year.
// Used by useGameState hook.

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  if (isMock()) {
    const year = parseInt(params.year, 10)
    const found = MOCK_YEARS.find((y) => y.year === year) ?? MOCK_YEARS[0]
    return NextResponse.json<ApiResponse<Year>>({ data: found as Year, error: null })
  }
  try {
    const year = parseInt(params.year, 10)
    if (isNaN(year)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Invalid year' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('years')
      .select('id, year, state, created_at')
      .eq('year', year)
      .single()

    if (error || !data) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<Year>>({ data: data as Year, error: null })
  } catch (err) {
    console.error('[GET /api/[year]/state]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
