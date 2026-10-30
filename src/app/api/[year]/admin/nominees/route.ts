import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type * as Models from '@/types'
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
  group: Models.CategoryGroup
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
    const { data: existingYear } = await db.one<Models.Year>(`SELECT id, year, state FROM "years" WHERE "year" = $1`, [year])

    if (existingYear) {
      yearRecord = existingYear
    } else {
      const { data: newYear, error: newYearError } = await db.writeOne("years", { year, state: 'voting' })
      if (newYearError || !newYear) throw newYearError ?? new Error('Failed to create year')
      yearRecord = newYear
    }

    if (!yearRecord) throw new Error('Failed to get or create year')

    for (const cat of categories) {
      // Upsert category
      const { data: catRecord, error: catError } = await db.writeOne("categories", {
            year_id: yearRecord.id,
            name: cat.name,
            name_tr: cat.name_tr,
            group: cat.group,
            order_index: cat.order_index,
          }, "year_id,name", false)

      if (catError || !catRecord) throw catError ?? new Error('Failed to upsert category')

      // Insert nominees — never overwrite is_winner on conflict
      const nomineeRows = cat.nominees.map((n) => ({
        category_id: catRecord.id,
        name: n.name,
        film_title: n.film_title ?? null,
      }))

      const { error: nomError } = await db.write("nominees", nomineeRows, "category_id,name", true)

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
