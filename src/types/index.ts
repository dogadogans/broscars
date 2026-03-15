export type GameState = 'voting' | 'results' | 'offseason'
export type Locale = 'en' | 'tr'

export interface Year {
  id: string
  year: number
  state: GameState
  created_at: string
}

export type CategoryGroup =
  | 'solo_picture'
  | 'solo_director'
  | 'acting'
  | 'features'
  | 'writing'
  | 'craft_sound'
  | 'shorts'

export interface Category {
  id: string
  year_id: string
  name: string
  name_tr: string
  group: CategoryGroup
  order_index: number
}

export interface Nominee {
  id: string
  category_id: string
  name: string
  film_title: string | null
  is_winner: boolean
}

export interface User {
  id: string
  token: string
  display_name: string
  pin_hash: string | null
  avatar_color: string
  created_at: string
}

export interface UserPick {
  id: string
  user_id: string
  year_id: string
  category_id: string
  head_nominee_id: string
  heart_nominee_id: string | null
  note: string | null
  submitted_at: string | null
}

export interface Score {
  id: string
  user_id: string
  year_id: string
  score: number
  heart_correct: number
  calculated_at: string
}

// Composite types for UI rendering

export interface CategoryWithNominees extends Category {
  nominees: Nominee[]
}

export interface PickWithDetails {
  pick: UserPick
  user: { id: string; display_name: string; avatar_color: string }
  category: { id: string; name: string; name_tr: string }
  head_nominee: { id: string; name: string; film_title: string | null }
  heart_nominee: { id: string; name: string; film_title: string | null } | null
}

export interface RankedScore {
  rank: number
  user: { id: string; display_name: string; avatar_color: string }
  score: number
  heart_correct: number
  accuracy: number // 0–100 percentage
  total_categories: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Local pick state used during the voting flow (before submission)
export interface LocalPick {
  category_id: string
  head_nominee_id: string | null
  heart_nominee_id: string | null
  note: string
}
