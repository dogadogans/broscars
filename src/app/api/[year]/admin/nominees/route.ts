import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

function validateAdminPassword(req: NextRequest): boolean {
  const provided =
    req.headers.get('x-admin-password') ??
    ''
  return provided === process.env.ADMIN_PASSWORD
}

interface NomineeInput {
  name: string
  film_title?: string
}

interface CategoryInput {
  name: string
  name_tr: string
  group: string
  order_index: number
  nominees: NomineeInput[]
}

// POST /api/[year]/admin/nominees
// Header: x-admin-password
// Body: { categories: CategoryInput[] }
// Creates year record if needed, then upserts categories and nominees.

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
    const categories: CategoryInput[] = body.categories ?? []

    // Get or create year (never overwrite existing state)
    let yearRecord: { id: string; year: number; state: string } | null = null
    const { data: existingYear } = await supabase
      .from('years')
      .select('id, year, state')
      .eq('year', year)
      .single()

    if (existingYear) {
      yearRecord = existingYear
    } else {
      const { data: newYear, error: newYearError } = await supabase
        .from('years')
        .insert({ year, state: 'voting' })
        .select()
        .single()
      if (newYearError || !newYear) throw newYearError ?? new Error('Failed to create year')
      yearRecord = newYear
    }

    if (!yearRecord) throw new Error('Failed to get or create year')

    for (const cat of categories) {
      // Upsert category
      const { data: catRecord, error: catError } = await supabase
        .from('categories')
        .upsert(
          {
            year_id: yearRecord.id,
            name: cat.name,
            name_tr: cat.name_tr,
            group: cat.group,
            order_index: cat.order_index,
          },
          { onConflict: 'year_id,name' }
        )
        .select()
        .single()

      if (catError || !catRecord) throw catError ?? new Error('Failed to upsert category')

      // Insert nominees — never overwrite is_winner on conflict
      const nomineeRows = cat.nominees.map((n) => ({
        category_id: catRecord.id,
        name: n.name,
        film_title: n.film_title ?? null,
      }))

      const { error: nomError } = await supabase
        .from('nominees')
        .upsert(nomineeRows, { onConflict: 'category_id,name', ignoreDuplicates: true })

      if (nomError) throw nomError
    }

    return NextResponse.json<ApiResponse<{ year: number; categories: number }>>(
      { data: { year, categories: categories.length }, error: null }
    )
  } catch (err) {
    console.error('[POST /api/[year]/admin/nominees]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
