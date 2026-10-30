import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type * as Models from '@/types'
import { isMock, getMockNominees } from '@/lib/mock'
import type { ApiResponse, CategoryWithNominees } from '@/types'

export const dynamic = 'force-dynamic'

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
    const { data: yearRecord, error: yearError } = await db.one<Models.Year>(`SELECT id FROM "years" WHERE "year" = $1`, [year])

    if (yearError || !yearRecord) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Year not found' },
        { status: 404 }
      )
    }

    const { data: categories, error: catError } = await db.many<Models.Category>(`SELECT * FROM "categories" WHERE "year_id" = $1 ORDER BY "order_index" ASC`, [yearRecord.id])

    if (catError) throw catError

    const categoryIds = (categories ?? []).map((c: { id: string }) => c.id)

    const { data: nominees, error: nomError } = await db.many<Models.Nominee>(`SELECT id, category_id, name, film_title, is_winner FROM "nominees" WHERE "category_id" = ANY($1)`, [categoryIds])

    if (nomError) throw nomError

    const nomineesByCategory = new Map<string, unknown[]>()
    for (const n of nominees ?? []) {
      const nom = n as { category_id: string }
      if (!nomineesByCategory.has(nom.category_id)) nomineesByCategory.set(nom.category_id, [])
      nomineesByCategory.get(nom.category_id)!.push(n)
    }

    const result = (categories ?? []).map((cat: { id: string }) => ({
      ...cat,
      nominees: nomineesByCategory.get(cat.id) ?? [],
    }))

    return NextResponse.json<ApiResponse<CategoryWithNominees[]>>(
      { data: result as CategoryWithNominees[], error: null },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (err) {
    console.error('[GET /api/[year]/nominees]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
