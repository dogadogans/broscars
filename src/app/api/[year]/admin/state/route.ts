import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import type { ApiResponse, GameState, Year } from '@/types'

function validateAdminPassword(req: NextRequest): boolean {
  return (req.headers.get('x-admin-password') ?? '') === process.env.ADMIN_PASSWORD
}

// POST /api/[year]/admin/state
// Header: x-admin-password
// Body: { state: GameState }
// Updates the game state for the year.

export async function POST(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  if (!validateAdminPassword(req)) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const year = parseInt(params.year, 10)
    if (isNaN(year)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Invalid year' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const state: GameState = body.state

    if (!['voting', 'results', 'offseason'].includes(state)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Invalid state. Must be voting | results | offseason' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('years')
      .update({ state })
      .eq('year', year)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<Year>>({ data: data as Year, error: null })
  } catch (err) {
    console.error('[POST /api/[year]/admin/state]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
