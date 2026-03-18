-- Broscar — Supabase Schema
-- Run this in the Supabase SQL editor to set up your database.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- YEARS
-- Tracks each Oscar ceremony year and the current game state.
-- ============================================================
CREATE TABLE years (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  year        int  UNIQUE NOT NULL,
  state       text NOT NULL DEFAULT 'offseason'
                CHECK (state IN ('voting', 'results', 'offseason')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CATEGORIES
-- Each Oscar category for a given year.
-- ============================================================
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_id     uuid NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  name        text NOT NULL,
  name_tr     text NOT NULL,
  "group"     text NOT NULL DEFAULT 'craft_sound'
                CHECK ("group" IN ('solo_picture','solo_director','acting','features','writing','craft_sound','shorts')),
  order_index int  NOT NULL,
  UNIQUE (year_id, name)
);

-- Migration for existing databases (run if table already exists):
-- ALTER TABLE categories ADD COLUMN IF NOT EXISTS "group" text NOT NULL DEFAULT 'craft_sound'
--   CHECK ("group" IN ('solo_picture','solo_director','acting','features','writing','craft_sound','shorts'));

CREATE INDEX idx_categories_year_id ON categories (year_id);

-- ============================================================
-- NOMINEES
-- Each nominee within a category.
-- ============================================================
CREATE TABLE nominees (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid    NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        text    NOT NULL,
  film_title  text,
  is_winner   boolean NOT NULL DEFAULT false,
  UNIQUE (category_id, name)
);

CREATE INDEX idx_nominees_category_id ON nominees (category_id);

-- ============================================================
-- USERS
-- Device-token-based identity. No passwords for V1.
-- ============================================================
CREATE TABLE users (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  token        uuid UNIQUE NOT NULL,
  display_name text NOT NULL,
  pin_hash     text,           -- reserved for V2 cross-device recovery
  avatar_color text NOT NULL DEFAULT '#d4af37',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PICKS
-- One row per user per category per year.
-- submitted_at is NULL until the user clicks "Lock in my picks".
-- ============================================================
CREATE TABLE picks (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  year_id          uuid NOT NULL REFERENCES years(id)    ON DELETE CASCADE,
  category_id      uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  head_nominee_id  uuid NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
  heart_nominee_id uuid          REFERENCES nominees(id) ON DELETE SET NULL,
  note             text,
  submitted_at     timestamptz,
  UNIQUE (user_id, year_id, category_id)
);

CREATE INDEX idx_picks_user_id ON picks (user_id);
CREATE INDEX idx_picks_year_id ON picks (year_id);

-- ============================================================
-- YEAR_PARTICIPANTS
-- Tracks which users have joined each year.
-- Inserted when a user authenticates with a year context.
-- ============================================================
CREATE TABLE year_participants (
  user_id    uuid NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  year_id    uuid NOT NULL REFERENCES years(id)  ON DELETE CASCADE,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, year_id)
);

CREATE INDEX idx_year_participants_year_id ON year_participants (year_id);

-- Migration for existing databases:
-- CREATE TABLE IF NOT EXISTS year_participants (
--   user_id    uuid NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
--   year_id    uuid NOT NULL REFERENCES years(id)  ON DELETE CASCADE,
--   joined_at  timestamptz NOT NULL DEFAULT now(),
--   PRIMARY KEY (user_id, year_id)
-- );
-- CREATE INDEX IF NOT EXISTS idx_year_participants_year_id ON year_participants (year_id);

-- ============================================================
-- SCORES
-- Calculated after the admin enters winners.
-- One row per user per year. Recalculated on each admin trigger.
-- ============================================================
CREATE TABLE scores (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        uuid NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  year_id        uuid NOT NULL REFERENCES years(id)  ON DELETE CASCADE,
  score          int  NOT NULL DEFAULT 0,
  heart_correct  int  NOT NULL DEFAULT 0,
  calculated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year_id)
);

CREATE INDEX idx_scores_year_id ON scores (year_id);

-- Case-insensitive unique display_name so 'John' and 'john' map to the same account
-- (the app uses .ilike() to look up users by name)
CREATE UNIQUE INDEX users_display_name_lower_idx ON users (lower(display_name));

-- ============================================================
-- ROW LEVEL SECURITY
-- All data access goes through the service role key via Next.js
-- API routes, which bypasses RLS. Enabling RLS here blocks direct
-- anon/client access to all tables without affecting the app.
-- No policies are needed — service role is exempt from RLS.
-- ============================================================
ALTER TABLE years             ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_participants  ENABLE ROW LEVEL SECURITY;
