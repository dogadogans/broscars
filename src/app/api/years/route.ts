import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
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
    const { data, error } = await supabase
      .from('years')
      .select('id, year, state, created_at')
      .order('year', { ascending: false })

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
