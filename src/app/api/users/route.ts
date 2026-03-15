import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getAvatarColor } from '@/lib/utils/avatar'
import { isMock } from '@/lib/mock'
import type { ApiResponse, User } from '@/types'

function hashPin(pin: string) {
  return createHash('sha256').update(pin).digest('hex')
}

async function recordYearParticipant(userId: string, year: number | undefined) {
  if (!year) return
  const { data: yearRecord } = await supabase
    .from('years')
    .select('id')
    .eq('year', year)
    .single()
  if (!yearRecord) return
  await supabase
    .from('year_participants')
    .upsert({ user_id: userId, year_id: yearRecord.id }, { onConflict: 'user_id,year_id', ignoreDuplicates: true })
}

// POST /api/users
// Body: { display_name: string, pin?: string, year: number, token?: string }
// Logic:
//   - If token matches existing user → return that user (idempotent re-join)
//   - If display_name matches existing user:
//       - pin_hash set + pin matches → log in (update token), return user
//       - pin_hash set + pin wrong   → 401
//       - pin_hash null              → set pin, update token, return user
//   - No existing user → create new user with pin_hash

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { display_name, pin, year, token: clientToken } = body as {
    display_name?: string
    pin?: string
    year?: number
    token?: string
  }

  if (isMock()) {
    const token = clientToken ?? crypto.randomUUID()
    const avatar_color = getAvatarColor(display_name?.trim() ?? 'User')
    const mockUser: User = {
      id: 'mock-user-' + token.slice(0, 8),
      token,
      display_name: display_name?.trim() ?? 'User',
      pin_hash: pin ? hashPin(pin) : null,
      avatar_color,
      created_at: new Date().toISOString(),
    }
    return NextResponse.json<ApiResponse<{ token: string; user: User; nameTaken: boolean }>>(
      { data: { token, user: mockUser, nameTaken: false }, error: null },
      { status: 201 }
    )
  }

  try {
    if (!display_name?.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'display_name is required' },
        { status: 400 }
      )
    }

    // 1. If a token is provided and matches an existing user, return them directly.
    if (clientToken) {
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('token', clientToken)
        .single()

      if (existing) {
        await recordYearParticipant(existing.id, year)
        return NextResponse.json<ApiResponse<{ token: string; user: User; nameTaken: boolean }>>(
          { data: { token: clientToken, user: existing as User, nameTaken: false }, error: null }
        )
      }
    }

    // 2. Check if display_name already exists.
    const { data: nameMatch } = await supabase
      .from('users')
      .select('*')
      .ilike('display_name', display_name.trim())
      .maybeSingle()

    if (nameMatch) {
      const user = nameMatch as User

      if (user.pin_hash) {
        // Account has a pin — verify it.
        if (!pin || hashPin(pin) !== user.pin_hash) {
          return NextResponse.json<ApiResponse<null>>(
            { data: null, error: 'Yanlış PIN' },
            { status: 401 }
          )
        }
      }

      // Pin matches (or account had no pin — set it now).
      const updates: Record<string, string> = {}
      if (clientToken) updates.token = clientToken
      if (!user.pin_hash && pin) updates.pin_hash = hashPin(pin)

      if (Object.keys(updates).length > 0) {
        await supabase.from('users').update(updates).eq('id', user.id)
      }

      const returnedToken = clientToken ?? user.token
      await recordYearParticipant(user.id, year)
      return NextResponse.json<ApiResponse<{ token: string; user: User; nameTaken: boolean }>>(
        { data: { token: returnedToken, user, nameTaken: false }, error: null }
      )
    }

    // 3. No existing user — create one.
    const token = clientToken ?? crypto.randomUUID()
    const avatar_color = getAvatarColor(display_name.trim())
    const pin_hash = pin ? hashPin(pin) : null

    const { data, error } = await supabase
      .from('users')
      .insert({ token, display_name: display_name.trim(), avatar_color, pin_hash })
      .select()
      .single()

    if (error) throw error

    await recordYearParticipant((data as User).id, year)
    return NextResponse.json<ApiResponse<{ token: string; user: User; nameTaken: boolean }>>(
      { data: { token, user: data as User, nameTaken: false }, error: null },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/users]', err)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
