import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { isMock, getMockNominees } from '@/lib/mock'
import type { ApiResponse, CategoryWithNominees } from '@/types'

// GET /api/[year]/nominees
// Returns all categories with their nominees for the given year, sorted by order_index.

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  if (isMock()) {
    const year = parseInt(params.year, 10)
    return NextResponse.json<ApiResponse<CategoryWithNominees[]>>({
      data: getMockNominees(year) as CategoryWithNominees[],
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

    // Resolve year record
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

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*, nominees(*)')
      .eq('year_id', yearRecord.id)
      .order('order_index', { ascending: true })

    if (catError) throw catError

    return NextResponse.json<ApiResponse<CategoryWithNominees[]>>(
      { data: categories as CategoryWithNominees[], error: null }
    )
  } catch (err) {
    console.error('[GET /api/[year]/nominees]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
