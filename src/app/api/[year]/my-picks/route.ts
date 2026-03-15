import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { resolveUserFromToken } from '@/lib/utils/token'
import type { ApiResponse } from '@/types'

// GET /api/[year]/my-picks
// Returns the number of submitted picks for the authenticated user.
// Requires x-device-token header.

export async function GET(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  const year = parseInt(params.year, 10)
  if (isNaN(year)) {
    return NextResponse.json<ApiResponse<{ submitted_count: number }>>(
      { data: { submitted_count: 0 }, error: null }
    )
  }

  const token = req.headers.get('x-device-token')
  const user = await resolveUserFromToken(token)
  if (!user) {
    return NextResponse.json<ApiResponse<{ submitted_count: number }>>(
      { data: { submitted_count: 0 }, error: null }
    )
  }

  const { data: yearRecord } = await supabase
    .from('years')
    .select('id')
    .eq('year', year)
    .single()

  if (!yearRecord) {
    return NextResponse.json<ApiResponse<{ submitted_count: number }>>(
      { data: { submitted_count: 0 }, error: null }
    )
  }

  const { count } = await supabase
    .from('picks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('year_id', yearRecord.id)
    .not('submitted_at', 'is', null)

  return NextResponse.json<ApiResponse<{ submitted_count: number }>>(
    { data: { submitted_count: count ?? 0 }, error: null }
  )
}
