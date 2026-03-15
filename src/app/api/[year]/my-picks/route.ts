import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { resolveUserFromToken } from '@/lib/utils/token'
import type { ApiResponse, PickWithDetails } from '@/types'

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

  const { data: yearRecord } = await supabase
    .from('years')
    .select('id')
    .eq('year', year)
    .single()

  if (!yearRecord) {
    return NextResponse.json<ApiResponse<{ picks: PickWithDetails[]; submitted_count: number }>>(
      { data: { picks: [], submitted_count: 0 }, error: null }
    )
  }

  const { data: rows, error } = await supabase
    .from('picks')
    .select(`
      *,
      user:users(id, display_name, avatar_color),
      category:categories(id, name, name_tr),
      head_nominee:nominees!head_nominee_id(id, name, film_title),
      heart_nominee:nominees!heart_nominee_id(id, name, film_title)
    `)
    .eq('user_id', user.id)
    .eq('year_id', yearRecord.id)
    .not('submitted_at', 'is', null)

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }

  // eslint-disable-next-line -- supabase join type
  const picks: PickWithDetails[] = (rows ?? []).map((row: any) => ({
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
