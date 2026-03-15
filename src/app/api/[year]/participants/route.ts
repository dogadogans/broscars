import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
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

    const { data: userIds, error } = await supabase
      .from('picks')
      .select('user_id')
      .eq('year_id', yearRecord.id)
      .not('submitted_at', 'is', null)

    const count = new Set((userIds ?? []).map((r) => r.user_id)).size

    if (error) throw error

    return NextResponse.json<ApiResponse<{ count: number }>>(
      { data: { count }, error: null }
    )
  } catch (err) {
    console.error('[GET /api/[year]/participants]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
