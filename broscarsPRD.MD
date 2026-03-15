# Broscar 🏆
### Oscar predictions for you and your people
**PRD v1.0 — March 2026**

---

## 1. Product Overview

Broscar is an annual, shareable web app where friends predict Oscar winners, track results, and build a multi-year history of picks, scores, and bragging rights. Simple enough to join via a link with no account, beautiful enough to feel special, and persistent enough to become a yearly ritual.

### The Problem
Oscar season is social. Friends argue about who should win, who will win, and who was robbed. There's no lightweight, beautiful place for a small group to make their picks together, compare results instantly, and remember who was right year after year.

### Key Goals
- **Annual ritual** — runs every year, stores all history, grows richer over time
- **No accounts** — join with a name and generated avatar, tracked via local device token
- **Two languages** — English and Turkish, switchable with one tap
- **Beautiful and fast** — feels like a product, not a form
- **Open source friendly** — self-hostable by others with minimal config

### Product Info

| | |
|---|---|
| **App name** | Broscar |
| **Primary users** | Small groups of friends, 2–20 people |
| **Access model** | Shareable link, no login required |
| **Languages** | English (default) + Turkish |
| **Platforms** | Web — mobile-first, works on desktop too |
| **Data persistence** | Supabase (Postgres), free tier |
| **Hosting** | Vercel (free tier) |
| **Tech stack** | Next.js App Router, Tailwind CSS, Supabase |

---

## 2. Tech Stack

### Why Each Tool

**Next.js App Router**
The framework. Handles routing, server-side logic, and API routes. App Router is the modern approach — each folder is a route, server and client components are kept separate.

**Supabase**
The database. Postgres under the hood, free tier, has a simple JS client. Stores users, picks, nominees, winners, and scores. Never called directly from the browser — always via Next.js API routes.

**Tailwind CSS**
Utility-first CSS. Fast to write, consistent output, no separate stylesheet files to manage.

**Vercel**
Deployment. One command (`vercel --prod`) and the app is live with a shareable URL. Free tier is more than enough for this scale.

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

---

## 3. Game States

The app has three distinct states throughout the year. The active state controls what every screen shows.

### State A — Voting (Pre-ceremony)
Active from when nominees are loaded until the ceremony begins.

- Users can join, pick a name, pick an avatar, and submit predictions
- Picks are locked after final submission — edit is allowed before submitting only
- Group wall shows everyone's picks in real time
- Admin closes voting by switching state to Results after the ceremony

### State B — Results (Post-ceremony)
Active after the admin enters the winners.

- Leaderboard shows ranked scores
- Individual cards show each person's hits and misses per category
- Heart picks, accuracy rate, and head/heart disagreements shown as secondary stats
- Year winner celebrated prominently

### State C — Off-season (Rest of year)
Active from results being published until next year's nominees are loaded.

- App shows the current year's winner and final leaderboard in read-only mode
- Historical years are browsable
- No new picks possible
- Quiet "Next Oscars" notice can appear in the nav

---

## 4. Identity & Persistence (No-Account Model)

No accounts. No passwords for V1. Identity is tied to the device.

### How It Works
- On first visit, the app generates a unique UUID token and stores it in `localStorage`
- This token is the user's persistent identity across all sessions on that device
- Token is linked to their chosen display name and avatar
- As long as they use the same browser/device, they're automatically recognized

### Display Names
- Free text, chosen at onboarding
- Must be unique within a given year (soft warning if duplicate exists)
- Persist year to year via the device token

### V2: Cross-Device Recovery
When a user opens Broscar on a new device, they can reclaim their identity:

1. Enter their display name
2. Enter their 4-digit PIN (set at first join)
3. App sends a `POST` to `/api/auth/recover` → Next.js checks Supabase → if name + PIN hash match, returns original token
4. Device token is updated and pick history is linked

```
Browser → POST /api/auth/recover → Next.js API route → Supabase → return token
```

On the original device: no action needed. Token is in localStorage, app recognizes them silently.

---

## 5. Avatar System

### V1 — Generated Initials Avatars
- Initials extracted from display name (e.g. "Doga" → "D")
- Random background color assigned at onboarding, persists via token
- Rendered as a simple colored circle with white initial
- No external service needed — pure CSS/JS

### V2 — Extended Options
- Custom photo upload
- Nominee face avatar pack (actors/directors pulled from TMDB)

---

## 6. Picking Flow

### Grouped Steps (8 steps, not 24)

To avoid fatigue, categories are grouped into 8 steps instead of 24 individual screens. Each group shares a single scrollable screen.

| Step | Group | Categories inside |
|---|---|---|
| 1 | Best picture | Solo — gets its own moment |
| 2 | Best director | Solo — people care |
| 3 | Acting | Best actress, Best actor, Best supporting actress, Best supporting actor |
| 4 | Features | Best international feature, Best animated feature, Best documentary feature |
| 5 | Writing | Best original screenplay, Best adapted screenplay |
| 6 | Craft & Sound | Cinematography, Film editing, Original score, Sound, Original song, Visual effects, Production design, Costume design, Makeup & hairstyling |
| 7 | Short films | Best animated short, Best live action short, Best documentary short |

The **Craft & Sound step** uses a compact two-column grid layout (quick-fire tapping, no heart option) since these are mostly educated guesses. All other steps use full nominee cards.

Each step shows a pill tag (e.g. "4 categories") so users know what they're committing to before scrolling.

### Database: `group` field on categories

Categories need a `group` field in the schema to tell the frontend which step to render them on and how:

```
solo_picture | solo_director | acting | features | writing | craft_sound | shorts
```

### Navigation
- 8 steps total with a progress bar and pip dots at the top
- Previous and Next buttons throughout
- Skipping allowed — unanswered categories flagged on the review screen

### Nominee Cards

Each nominee card shows:
- **Name** (primary, larger)
- **Film title** (secondary, smaller, italic below the name)

This is especially important for craft categories where the person's name means nothing without the film context (e.g. "Greig Fraser" alone is meaningless — "Greig Fraser / A Complete Unknown" is not).

### The Pick Mechanic

Each nominee is shown as a selectable card (text only in V1, photos in V2).

**Head pick (required)**
- Tap a nominee card to select it as your head pick — who you think will win
- One head pick per category
- Selected card is visually highlighted

**Heart pick (optional)**
- Small heart icon on each full nominee card
- Tap to mark as your heart pick — who you want to win
- One heart pick per category
- Can be the same as your head pick (head and heart agree)
- Not shown on compact Craft grid — those are quick picks only
- Does not affect scoring — purely expressive

**Note (optional)**
- Short text field shown once per step (not per category)
- Shown on the group wall alongside the pick

### Review & Edit
- After all 8 steps, a summary screen shows every pick at a glance
- Each row shows: category name, head pick, heart pick (if different), note (if any)
- Edit button on each row jumps directly back to that step
- Final Submit locks all picks — no changes after this point

---

## 7. Scoring

| Rule | Detail |
|---|---|
| Points | 1 point per correct head pick |
| Heart picks | Do not affect score |
| Tiebreaker 1 | Number of heart picks that were also correct |
| Tiebreaker 2 | Alphabetical display name |
| Max score | Equal to total number of categories |
| Secondary stat | Accuracy percentage |

---

## 8. Screen Architecture

URL structure uses year as a dynamic segment so future years are automatic.

| Route | Screen | Description | Scope |
|---|---|---|---|
| `/` | Home | Year selector + current state banner. Active year prominent, past years below. | MVP |
| `/[year]/join` | Onboarding | Enter name, pick avatar, set PIN. Generates device token. | MVP |
| `/[year]/vote` | Voting | Category-by-category picking flow with progress bar. | MVP |
| `/[year]/review` | Review | Summary of all picks before final submission. Edit links per row. | MVP |
| `/[year]/wall` | Group wall | Toggle between By Person and By Category views. | MVP |
| `/[year]/results` | Results | Leaderboard with scores, medals, per-person breakdowns. | MVP |
| `/[year]/admin` | Admin | Protected: load nominees, set game state, enter winners. | MVP |
| `/history` | History | Multi-year view: all years, winners, cross-year leaderboard. | V2 |
| `/profile/[token]` | Profile | Individual stats across years: accuracy rate, picks history. | V2 |

---

## 9. Multi-Year History

### Data Retained Per Year
- All categories and nominees for that year (stored in Supabase)
- All users' picks: head pick, heart pick, note, per category
- Official winners per category
- Final scores and ranking
- Year winner (highest score)

### V2: Cross-Year Leaderboard
- Aggregate accuracy rate across all participated years
- Win count: how many years a person had the highest score
- Participation count: how many years someone played
- Best year: highest score in any single year
- Identity matched via device token

---

## 10. Internationalisation (i18n)

No external library needed. All UI text is predefined so a simple JSON approach works.

### Implementation
- Two translation files: `en.json` and `tr.json` in `/locales`
- A `useTranslation` hook reads from the active locale
- Language toggle in nav bar (EN / TR) — switches instantly, persists via localStorage
- Oscar nominee names and film titles are never translated

### What Gets Translated
✅ All UI labels, buttons, headings, status messages  
✅ Error messages and empty states  
✅ Onboarding copy  
❌ Nominee names and film titles  
❌ User-entered notes  

---

## 11. Database Schema (Supabase)

```sql
-- Years
years (
  id uuid primary key,
  year int unique not null,
  state text check (state in ('voting', 'results', 'offseason')),
  created_at timestamptz default now()
)

-- Categories
categories (
  id uuid primary key,
  year_id uuid references years(id),
  name text not null,
  name_tr text not null,
  order_index int not null
)

-- Nominees
nominees (
  id uuid primary key,
  category_id uuid references categories(id),
  name text not null,
  film_title text,
  is_winner boolean default false
)

-- Users
users (
  id uuid primary key,
  token uuid unique not null,
  display_name text not null,
  pin_hash text,
  avatar_color text,
  created_at timestamptz default now()
)

-- Picks
picks (
  id uuid primary key,
  user_id uuid references users(id),
  year_id uuid references years(id),
  category_id uuid references categories(id),
  head_nominee_id uuid references nominees(id),
  heart_nominee_id uuid references nominees(id),
  note text,
  submitted_at timestamptz
)
```

---

## 12. Admin Panel (`/[year]/admin`)

Protected by `ADMIN_PASSWORD` environment variable. No user-facing login — just a password gate.

### Capabilities
- Load nominees: manually enter or paste nominees per category
- Set game state: Voting → Results → Off-season
- Enter winners: click the winning nominee per category after the ceremony
- Trigger score calculation after winners are entered

---

## 13. MVP Scope (2026 Ceremony)

### In Scope
- All screens marked MVP in Section 8
- Voting flow: head pick + heart pick + optional note
- Nominee cards as styled text (no photos in V1)
- Group wall: by person and by category views
- Results leaderboard with scores, medals, accuracy
- English + Turkish language toggle
- Generated initials avatars (colored circles)
- Device token identity stored in localStorage
- Admin panel: manage nominees, game state, winners
- TMDB attribution placeholder in footer (ready for V2)

### Deferred to V2
- Nominee photos (TMDB integration)
- Multi-year history screen and cross-year leaderboard
- Profile pages with per-user stats
- Custom photo avatar upload
- Nominee face avatar pack
- PIN-based cross-device recovery
- Countdown timer to next ceremony

---

## 14. Open Source Considerations

- All secrets in environment variables only — never committed
- `.env.example` documents all required variables
- README includes self-hosting setup instructions
- No hardcoded user data or group-specific content in the codebase
- MIT license

---

## 15. Nominee Data (V1 — Manual Entry)

Since TMDB is deferred to V2, nominees for 2026 are entered manually by the admin via the admin panel. The 2026 Oscar categories and nominees are already known and can be pasted in directly.

In V2, the admin panel will have a "Fetch from TMDB" button that auto-populates nominees and pulls photos.

---

*Broscar PRD — v1.0 — March 2026*