// Mock data for local development without Supabase.
// Enabled when MOCK_MODE=true in .env.local.

export function isMock() {
  return process.env.MOCK_MODE === 'true'
}

const Y = 'year-2026'
const Y25 = 'year-2025'

const CAT = {
  picture:    'cat-picture',
  director:   'cat-director',
  actor:      'cat-actor',
  supactor:   'cat-sup-actor',
  actress:    'cat-actress',
  supactress: 'cat-sup-actress',
  casting:    'cat-casting',
  animated:   'cat-animated',
  docfeat:    'cat-doc-feat',
  intl:       'cat-intl',
  adaptscr:   'cat-adapt-scr',
  origscr:    'cat-orig-scr',
  cinemato:   'cat-cinemato',
  editing:    'cat-editing',
  score:      'cat-score',
  sound:      'cat-sound',
  origsong:   'cat-orig-song',
  vfx:        'cat-vfx',
  proddesign: 'cat-prod-design',
  costume:    'cat-costume',
  makeup:     'cat-makeup',
  animshort:  'cat-anim-short',
  liveaction: 'cat-live-action',
  docshort:   'cat-doc-short',
}

function nid(cat: string, i: number) { return `nom-${cat}-${i}` }

export const MOCK_YEARS = [
  { id: Y,   year: 2026, state: 'voting'  as const, created_at: '2026-01-15T00:00:00Z' },
  { id: Y25, year: 2025, state: 'results' as const, created_at: '2025-01-15T00:00:00Z' },
]

export const MOCK_CATEGORIES_WITH_NOMINEES = [
  // ── solo_picture ────────────────────────────────────────────────────────────
  {
    id: CAT.picture, year_id: Y, name: 'Best Picture', name_tr: 'En İyi Film',
    group: 'solo_picture', order_index: 1,
    nominees: [
      { id: nid('pic', 1), category_id: CAT.picture, name: 'Bugonia',                  film_title: null, is_winner: false },
      { id: nid('pic', 2), category_id: CAT.picture, name: 'F1',                        film_title: null, is_winner: false },
      { id: nid('pic', 3), category_id: CAT.picture, name: 'Frankenstein',              film_title: null, is_winner: false },
      { id: nid('pic', 4), category_id: CAT.picture, name: 'Hamnet',                    film_title: null, is_winner: false },
      { id: nid('pic', 5), category_id: CAT.picture, name: 'Marty Supreme',             film_title: null, is_winner: false },
      { id: nid('pic', 6), category_id: CAT.picture, name: 'One Battle after Another',  film_title: null, is_winner: false },
      { id: nid('pic', 7), category_id: CAT.picture, name: 'The Secret Agent',          film_title: null, is_winner: false },
      { id: nid('pic', 8), category_id: CAT.picture, name: 'Sentimental Value',         film_title: null, is_winner: false },
      { id: nid('pic', 9), category_id: CAT.picture, name: 'Sinners',                   film_title: null, is_winner: false },
      { id: nid('pic',10), category_id: CAT.picture, name: 'Train Dreams',              film_title: null, is_winner: false },
    ],
  },

  // ── solo_director ────────────────────────────────────────────────────────────
  {
    id: CAT.director, year_id: Y, name: 'Directing', name_tr: 'En İyi Yönetmen',
    group: 'solo_director', order_index: 2,
    nominees: [
      { id: nid('dir', 1), category_id: CAT.director, name: 'Chloé Zhao',            film_title: 'Hamnet',                  is_winner: false },
      { id: nid('dir', 2), category_id: CAT.director, name: 'Josh Safdie',            film_title: 'Marty Supreme',           is_winner: false },
      { id: nid('dir', 3), category_id: CAT.director, name: 'Paul Thomas Anderson',   film_title: 'One Battle after Another', is_winner: false },
      { id: nid('dir', 4), category_id: CAT.director, name: 'Joachim Trier',          film_title: 'Sentimental Value',       is_winner: false },
      { id: nid('dir', 5), category_id: CAT.director, name: 'Ryan Coogler',           film_title: 'Sinners',                 is_winner: false },
    ],
  },

  // ── acting ───────────────────────────────────────────────────────────────────
  {
    id: CAT.actor, year_id: Y, name: 'Actor in a Leading Role', name_tr: 'En İyi Erkek Oyuncu',
    group: 'acting', order_index: 3,
    nominees: [
      { id: nid('acm', 1), category_id: CAT.actor, name: 'Timothée Chalamet',  film_title: 'Marty Supreme',            is_winner: false },
      { id: nid('acm', 2), category_id: CAT.actor, name: 'Leonardo DiCaprio',  film_title: 'One Battle after Another', is_winner: false },
      { id: nid('acm', 3), category_id: CAT.actor, name: 'Ethan Hawke',        film_title: 'Blue Moon',                is_winner: false },
      { id: nid('acm', 4), category_id: CAT.actor, name: 'Michael B. Jordan',  film_title: 'Sinners',                  is_winner: false },
      { id: nid('acm', 5), category_id: CAT.actor, name: 'Wagner Moura',       film_title: 'The Secret Agent',         is_winner: false },
    ],
  },
  {
    id: CAT.supactor, year_id: Y, name: 'Actor in a Supporting Role', name_tr: 'En İyi Yardımcı Erkek Oyuncu',
    group: 'acting', order_index: 4,
    nominees: [
      { id: nid('sm', 1), category_id: CAT.supactor, name: 'Benicio Del Toro',   film_title: 'One Battle after Another', is_winner: false },
      { id: nid('sm', 2), category_id: CAT.supactor, name: 'Jacob Elordi',       film_title: 'Frankenstein',             is_winner: false },
      { id: nid('sm', 3), category_id: CAT.supactor, name: 'Delroy Lindo',       film_title: 'Sinners',                  is_winner: false },
      { id: nid('sm', 4), category_id: CAT.supactor, name: 'Sean Penn',          film_title: 'One Battle after Another', is_winner: false },
      { id: nid('sm', 5), category_id: CAT.supactor, name: 'Stellan Skarsgård', film_title: 'Sentimental Value',        is_winner: false },
    ],
  },
  {
    id: CAT.actress, year_id: Y, name: 'Actress in a Leading Role', name_tr: 'En İyi Kadın Oyuncu',
    group: 'acting', order_index: 5,
    nominees: [
      { id: nid('act', 1), category_id: CAT.actress, name: 'Jessie Buckley',    film_title: 'Hamnet',                  is_winner: false },
      { id: nid('act', 2), category_id: CAT.actress, name: 'Rose Byrne',        film_title: 'If I Had Legs I\'d Kick You', is_winner: false },
      { id: nid('act', 3), category_id: CAT.actress, name: 'Kate Hudson',       film_title: 'Song Sung Blue',          is_winner: false },
      { id: nid('act', 4), category_id: CAT.actress, name: 'Renate Reinsve',    film_title: 'Sentimental Value',       is_winner: false },
      { id: nid('act', 5), category_id: CAT.actress, name: 'Emma Stone',        film_title: 'Bugonia',                 is_winner: false },
    ],
  },
  {
    id: CAT.supactress, year_id: Y, name: 'Actress in a Supporting Role', name_tr: 'En İyi Yardımcı Kadın Oyuncu',
    group: 'acting', order_index: 6,
    nominees: [
      { id: nid('sa', 1), category_id: CAT.supactress, name: 'Elle Fanning',             film_title: 'Sentimental Value',        is_winner: false },
      { id: nid('sa', 2), category_id: CAT.supactress, name: 'Inga Ibsdotter Lilleaas', film_title: 'Sentimental Value',        is_winner: false },
      { id: nid('sa', 3), category_id: CAT.supactress, name: 'Amy Madigan',              film_title: 'Weapons',                  is_winner: false },
      { id: nid('sa', 4), category_id: CAT.supactress, name: 'Wunmi Mosaku',             film_title: 'Sinners',                  is_winner: false },
      { id: nid('sa', 5), category_id: CAT.supactress, name: 'Teyana Taylor',            film_title: 'One Battle after Another', is_winner: false },
    ],
  },
  {
    id: CAT.casting, year_id: Y, name: 'Casting', name_tr: 'En İyi Oyuncu Seçimi',
    group: 'acting', order_index: 7,
    nominees: [
      { id: nid('cas', 1), category_id: CAT.casting, name: 'Nina Gold',              film_title: 'Hamnet',                  is_winner: false },
      { id: nid('cas', 2), category_id: CAT.casting, name: 'Jennifer Venditti',      film_title: 'Marty Supreme',           is_winner: false },
      { id: nid('cas', 3), category_id: CAT.casting, name: 'Cassandra Kulukundis',   film_title: 'One Battle after Another', is_winner: false },
      { id: nid('cas', 4), category_id: CAT.casting, name: 'Gabriel Domingues',      film_title: 'The Secret Agent',        is_winner: false },
      { id: nid('cas', 5), category_id: CAT.casting, name: 'Francine Maisler',       film_title: 'Sinners',                 is_winner: false },
    ],
  },

  // ── features ─────────────────────────────────────────────────────────────────
  {
    id: CAT.animated, year_id: Y, name: 'Animated Feature Film', name_tr: 'En İyi Animasyon Filmi',
    group: 'features', order_index: 8,
    nominees: [
      { id: nid('ani', 1), category_id: CAT.animated, name: 'Arco',                                    film_title: null, is_winner: false },
      { id: nid('ani', 2), category_id: CAT.animated, name: 'Elio',                                    film_title: null, is_winner: false },
      { id: nid('ani', 3), category_id: CAT.animated, name: 'KPop Demon Hunters',                      film_title: null, is_winner: false },
      { id: nid('ani', 4), category_id: CAT.animated, name: 'Little Amélie or the Character of Rain', film_title: null, is_winner: false },
      { id: nid('ani', 5), category_id: CAT.animated, name: 'Zootopia 2',                              film_title: null, is_winner: false },
    ],
  },
  {
    id: CAT.docfeat, year_id: Y, name: 'Documentary Feature Film', name_tr: 'En İyi Belgesel Film',
    group: 'features', order_index: 9,
    nominees: [
      { id: nid('doc', 1), category_id: CAT.docfeat, name: 'The Alabama Solution',              film_title: null, is_winner: false },
      { id: nid('doc', 2), category_id: CAT.docfeat, name: 'Come See Me in the Good Light',     film_title: null, is_winner: false },
      { id: nid('doc', 3), category_id: CAT.docfeat, name: 'Cutting through Rocks',             film_title: null, is_winner: false },
      { id: nid('doc', 4), category_id: CAT.docfeat, name: 'Mr. Nobody against Putin',          film_title: null, is_winner: false },
      { id: nid('doc', 5), category_id: CAT.docfeat, name: 'The Perfect Neighbor',              film_title: null, is_winner: false },
    ],
  },
  {
    id: CAT.intl, year_id: Y, name: 'International Feature Film', name_tr: 'En İyi Uluslararası Film',
    group: 'features', order_index: 10,
    nominees: [
      { id: nid('intl', 1), category_id: CAT.intl, name: 'Brazil',   film_title: 'The Secret Agent',         is_winner: false },
      { id: nid('intl', 2), category_id: CAT.intl, name: 'France',   film_title: 'It Was Just an Accident',  is_winner: false },
      { id: nid('intl', 3), category_id: CAT.intl, name: 'Norway',   film_title: 'Sentimental Value',        is_winner: false },
      { id: nid('intl', 4), category_id: CAT.intl, name: 'Spain',    film_title: 'Sirāt',                    is_winner: false },
      { id: nid('intl', 5), category_id: CAT.intl, name: 'Tunisia',  film_title: 'The Voice of Hind Rajab',  is_winner: false },
    ],
  },

  // ── writing ──────────────────────────────────────────────────────────────────
  {
    id: CAT.adaptscr, year_id: Y, name: 'Writing (Adapted Screenplay)', name_tr: 'En İyi Uyarlama Senaryo',
    group: 'writing', order_index: 11,
    nominees: [
      { id: nid('as', 1), category_id: CAT.adaptscr, name: 'Bugonia',                  film_title: 'Will Tracy',                        is_winner: false },
      { id: nid('as', 2), category_id: CAT.adaptscr, name: 'Frankenstein',             film_title: 'Guillermo del Toro',                is_winner: false },
      { id: nid('as', 3), category_id: CAT.adaptscr, name: 'Hamnet',                   film_title: 'Chloé Zhao & Maggie O\'Farrell',    is_winner: false },
      { id: nid('as', 4), category_id: CAT.adaptscr, name: 'One Battle after Another', film_title: 'Paul Thomas Anderson',              is_winner: false },
      { id: nid('as', 5), category_id: CAT.adaptscr, name: 'Train Dreams',             film_title: 'Clint Bentley & Greg Kwedar',       is_winner: false },
    ],
  },
  {
    id: CAT.origscr, year_id: Y, name: 'Writing (Original Screenplay)', name_tr: 'En İyi Orijinal Senaryo',
    group: 'writing', order_index: 12,
    nominees: [
      { id: nid('os', 1), category_id: CAT.origscr, name: 'Blue Moon',           film_title: 'Robert Kaplow',                     is_winner: false },
      { id: nid('os', 2), category_id: CAT.origscr, name: 'It Was Just an Accident', film_title: 'Jafar Panahi',                  is_winner: false },
      { id: nid('os', 3), category_id: CAT.origscr, name: 'Marty Supreme',       film_title: 'Ronald Bronstein & Josh Safdie',    is_winner: false },
      { id: nid('os', 4), category_id: CAT.origscr, name: 'Sentimental Value',   film_title: 'Eskil Vogt, Joachim Trier',         is_winner: false },
      { id: nid('os', 5), category_id: CAT.origscr, name: 'Sinners',             film_title: 'Ryan Coogler',                      is_winner: false },
    ],
  },

  // ── craft_sound ──────────────────────────────────────────────────────────────
  {
    id: CAT.cinemato, year_id: Y, name: 'Cinematography', name_tr: 'Görüntü Yönetimi',
    group: 'craft_sound', order_index: 13,
    nominees: [
      { id: nid('ci', 1), category_id: CAT.cinemato, name: 'Dan Laustsen',              film_title: 'Frankenstein',             is_winner: false },
      { id: nid('ci', 2), category_id: CAT.cinemato, name: 'Darius Khondji',            film_title: 'Marty Supreme',            is_winner: false },
      { id: nid('ci', 3), category_id: CAT.cinemato, name: 'Michael Bauman',            film_title: 'One Battle after Another', is_winner: false },
      { id: nid('ci', 4), category_id: CAT.cinemato, name: 'Autumn Durald Arkapaw',     film_title: 'Sinners',                  is_winner: false },
      { id: nid('ci', 5), category_id: CAT.cinemato, name: 'Adolpho Veloso',            film_title: 'Train Dreams',             is_winner: false },
    ],
  },
  {
    id: CAT.editing, year_id: Y, name: 'Film Editing', name_tr: 'Film Kurgusu',
    group: 'craft_sound', order_index: 14,
    nominees: [
      { id: nid('ed', 1), category_id: CAT.editing, name: 'Stephen Mirrione',                film_title: 'F1',                       is_winner: false },
      { id: nid('ed', 2), category_id: CAT.editing, name: 'Ronald Bronstein & Josh Safdie',  film_title: 'Marty Supreme',            is_winner: false },
      { id: nid('ed', 3), category_id: CAT.editing, name: 'Andy Jurgensen',                  film_title: 'One Battle after Another', is_winner: false },
      { id: nid('ed', 4), category_id: CAT.editing, name: 'Olivier Bugge Coutté',            film_title: 'Sentimental Value',        is_winner: false },
      { id: nid('ed', 5), category_id: CAT.editing, name: 'Michael P. Shawver',              film_title: 'Sinners',                  is_winner: false },
    ],
  },
  {
    id: CAT.score, year_id: Y, name: 'Music (Original Score)', name_tr: 'Orijinal Müzik',
    group: 'craft_sound', order_index: 15,
    nominees: [
      { id: nid('sc', 1), category_id: CAT.score, name: 'Jerskin Fendrix',    film_title: 'Bugonia',                  is_winner: false },
      { id: nid('sc', 2), category_id: CAT.score, name: 'Alexandre Desplat',  film_title: 'Frankenstein',             is_winner: false },
      { id: nid('sc', 3), category_id: CAT.score, name: 'Max Richter',        film_title: 'Hamnet',                   is_winner: false },
      { id: nid('sc', 4), category_id: CAT.score, name: 'Jonny Greenwood',    film_title: 'One Battle after Another', is_winner: false },
      { id: nid('sc', 5), category_id: CAT.score, name: 'Ludwig Goransson',   film_title: 'Sinners',                  is_winner: false },
    ],
  },
  {
    id: CAT.sound, year_id: Y, name: 'Sound', name_tr: 'Ses',
    group: 'craft_sound', order_index: 16,
    nominees: [
      { id: nid('so', 1), category_id: CAT.sound, name: 'F1',                       film_title: null, is_winner: false },
      { id: nid('so', 2), category_id: CAT.sound, name: 'Frankenstein',             film_title: null, is_winner: false },
      { id: nid('so', 3), category_id: CAT.sound, name: 'One Battle after Another', film_title: null, is_winner: false },
      { id: nid('so', 4), category_id: CAT.sound, name: 'Sinners',                  film_title: null, is_winner: false },
      { id: nid('so', 5), category_id: CAT.sound, name: 'Sirāt',                    film_title: null, is_winner: false },
    ],
  },
  {
    id: CAT.origsong, year_id: Y, name: 'Music (Original Song)', name_tr: 'Orijinal Şarkı',
    group: 'craft_sound', order_index: 17,
    nominees: [
      { id: nid('oso', 1), category_id: CAT.origsong, name: 'Dear Me',           film_title: 'Diane Warren: Relentless', is_winner: false },
      { id: nid('oso', 2), category_id: CAT.origsong, name: 'Golden',            film_title: 'KPop Demon Hunters',       is_winner: false },
      { id: nid('oso', 3), category_id: CAT.origsong, name: 'I Lied To You',     film_title: 'Sinners',                  is_winner: false },
      { id: nid('oso', 4), category_id: CAT.origsong, name: 'Sweet Dreams Of Joy', film_title: 'Viva Verdi!',            is_winner: false },
      { id: nid('oso', 5), category_id: CAT.origsong, name: 'Train Dreams',      film_title: 'Train Dreams',             is_winner: false },
    ],
  },
  {
    id: CAT.vfx, year_id: Y, name: 'Visual Effects', name_tr: 'Görsel Efektler',
    group: 'craft_sound', order_index: 18,
    nominees: [
      { id: nid('vf', 1), category_id: CAT.vfx, name: 'Avatar: Fire and Ash',        film_title: null, is_winner: false },
      { id: nid('vf', 2), category_id: CAT.vfx, name: 'F1',                           film_title: null, is_winner: false },
      { id: nid('vf', 3), category_id: CAT.vfx, name: 'Jurassic World Rebirth',       film_title: null, is_winner: false },
      { id: nid('vf', 4), category_id: CAT.vfx, name: 'The Lost Bus',                 film_title: null, is_winner: false },
      { id: nid('vf', 5), category_id: CAT.vfx, name: 'Sinners',                      film_title: null, is_winner: false },
    ],
  },
  {
    id: CAT.proddesign, year_id: Y, name: 'Production Design', name_tr: 'Prodüksiyon Tasarımı',
    group: 'craft_sound', order_index: 19,
    nominees: [
      { id: nid('pd', 1), category_id: CAT.proddesign, name: 'Frankenstein',             film_title: null, is_winner: false },
      { id: nid('pd', 2), category_id: CAT.proddesign, name: 'Hamnet',                   film_title: null, is_winner: false },
      { id: nid('pd', 3), category_id: CAT.proddesign, name: 'Marty Supreme',            film_title: null, is_winner: false },
      { id: nid('pd', 4), category_id: CAT.proddesign, name: 'One Battle after Another', film_title: null, is_winner: false },
      { id: nid('pd', 5), category_id: CAT.proddesign, name: 'Sinners',                  film_title: null, is_winner: false },
    ],
  },
  {
    id: CAT.costume, year_id: Y, name: 'Costume Design', name_tr: 'Kostüm Tasarımı',
    group: 'craft_sound', order_index: 20,
    nominees: [
      { id: nid('co', 1), category_id: CAT.costume, name: 'Deborah L. Scott',    film_title: 'Avatar: Fire and Ash', is_winner: false },
      { id: nid('co', 2), category_id: CAT.costume, name: 'Kate Hawley',         film_title: 'Frankenstein',         is_winner: false },
      { id: nid('co', 3), category_id: CAT.costume, name: 'Malgosia Turzanska',  film_title: 'Hamnet',               is_winner: false },
      { id: nid('co', 4), category_id: CAT.costume, name: 'Miyako Bellizzi',     film_title: 'Marty Supreme',        is_winner: false },
      { id: nid('co', 5), category_id: CAT.costume, name: 'Ruth E. Carter',      film_title: 'Sinners',              is_winner: false },
    ],
  },
  {
    id: CAT.makeup, year_id: Y, name: 'Makeup and Hairstyling', name_tr: 'Makyaj & Saç Tasarımı',
    group: 'craft_sound', order_index: 21,
    nominees: [
      { id: nid('mh', 1), category_id: CAT.makeup, name: 'Frankenstein',         film_title: null, is_winner: false },
      { id: nid('mh', 2), category_id: CAT.makeup, name: 'Kokuho',               film_title: null, is_winner: false },
      { id: nid('mh', 3), category_id: CAT.makeup, name: 'Sinners',              film_title: null, is_winner: false },
      { id: nid('mh', 4), category_id: CAT.makeup, name: 'The Smashing Machine', film_title: null, is_winner: false },
      { id: nid('mh', 5), category_id: CAT.makeup, name: 'The Ugly Stepsister',  film_title: null, is_winner: false },
    ],
  },

  // ── shorts ───────────────────────────────────────────────────────────────────
  {
    id: CAT.animshort, year_id: Y, name: 'Animated Short Film', name_tr: 'En İyi Animasyon Kısa Film',
    group: 'shorts', order_index: 22,
    nominees: [
      { id: nid('ash', 1), category_id: CAT.animshort, name: 'Butterfly',                        film_title: null, is_winner: false },
      { id: nid('ash', 2), category_id: CAT.animshort, name: 'Forevergreen',                     film_title: null, is_winner: false },
      { id: nid('ash', 3), category_id: CAT.animshort, name: 'The Girl Who Cried Pearls',        film_title: null, is_winner: false },
      { id: nid('ash', 4), category_id: CAT.animshort, name: 'Retirement Plan',                  film_title: null, is_winner: false },
      { id: nid('ash', 5), category_id: CAT.animshort, name: 'The Three Sisters',                film_title: null, is_winner: false },
    ],
  },
  {
    id: CAT.liveaction, year_id: Y, name: 'Live Action Short Film', name_tr: 'En İyi Kısa Film',
    group: 'shorts', order_index: 23,
    nominees: [
      { id: nid('ls', 1), category_id: CAT.liveaction, name: "Butcher's Stain",                      film_title: null, is_winner: false },
      { id: nid('ls', 2), category_id: CAT.liveaction, name: 'A Friend of Dorothy',                  film_title: null, is_winner: false },
      { id: nid('ls', 3), category_id: CAT.liveaction, name: "Jane Austen's Period Drama",           film_title: null, is_winner: false },
      { id: nid('ls', 4), category_id: CAT.liveaction, name: 'The Singers',                          film_title: null, is_winner: false },
      { id: nid('ls', 5), category_id: CAT.liveaction, name: 'Two People Exchanging Saliva',         film_title: null, is_winner: false },
    ],
  },
  {
    id: CAT.docshort, year_id: Y, name: 'Documentary Short Film', name_tr: 'En İyi Belgesel Kısa Film',
    group: 'shorts', order_index: 24,
    nominees: [
      { id: nid('ds', 1), category_id: CAT.docshort, name: 'All the Empty Rooms',                                     film_title: null, is_winner: false },
      { id: nid('ds', 2), category_id: CAT.docshort, name: 'Armed Only with a Camera: The Life and Death of Brent Renaud', film_title: null, is_winner: false },
      { id: nid('ds', 3), category_id: CAT.docshort, name: 'Children No More: "Were and Are Gone"',                  film_title: null, is_winner: false },
      { id: nid('ds', 4), category_id: CAT.docshort, name: 'The Devil Is Busy',                                       film_title: null, is_winner: false },
      { id: nid('ds', 5), category_id: CAT.docshort, name: 'Perfectly a Strangeness',                                 film_title: null, is_winner: false },
    ],
  },
]

const USER_A = { id: 'user-a', display_name: 'Doga', avatar_color: '#8e44ad' }
const USER_B = { id: 'user-b', display_name: 'Berk', avatar_color: '#2980b9' }
const USER_C = { id: 'user-c', display_name: 'Selin', avatar_color: '#16a085' }

export const MOCK_PICKS = [
  { pick: { id: 'p1', user_id: USER_A.id, year_id: Y, category_id: CAT.picture,  head_nominee_id: nid('pic', 9), heart_nominee_id: nid('pic', 5), note: 'Sinners all the way!',    submitted_at: '2026-03-01T10:00:00Z' }, user: USER_A, category: { id: CAT.picture,  name: 'Best Picture',              name_tr: 'En İyi Film'              }, head_nominee: { id: nid('pic', 9), name: 'Sinners',          film_title: null         }, heart_nominee: { id: nid('pic', 5), name: 'Marty Supreme',    film_title: null } },
  { pick: { id: 'p2', user_id: USER_A.id, year_id: Y, category_id: CAT.director, head_nominee_id: nid('dir', 5), heart_nominee_id: null,          note: null,                        submitted_at: '2026-03-01T10:00:00Z' }, user: USER_A, category: { id: CAT.director, name: 'Directing',                 name_tr: 'En İyi Yönetmen'          }, head_nominee: { id: nid('dir', 5), name: 'Ryan Coogler',     film_title: 'Sinners'    }, heart_nominee: null },
  { pick: { id: 'p3', user_id: USER_A.id, year_id: Y, category_id: CAT.actor,    head_nominee_id: nid('acm', 1), heart_nominee_id: nid('acm', 1), note: null,                        submitted_at: '2026-03-01T10:00:00Z' }, user: USER_A, category: { id: CAT.actor,    name: 'Actor in a Leading Role',   name_tr: 'En İyi Erkek Oyuncu'     }, head_nominee: { id: nid('acm',1), name: 'Timothée Chalamet', film_title: 'Marty Supreme' }, heart_nominee: { id: nid('acm',1), name: 'Timothée Chalamet', film_title: 'Marty Supreme' } },
  { pick: { id: 'p4', user_id: USER_B.id, year_id: Y, category_id: CAT.picture,  head_nominee_id: nid('pic', 6), heart_nominee_id: null,          note: 'PTA never misses',          submitted_at: '2026-03-02T08:00:00Z' }, user: USER_B, category: { id: CAT.picture,  name: 'Best Picture',              name_tr: 'En İyi Film'              }, head_nominee: { id: nid('pic', 6), name: 'One Battle after Another', film_title: null }, heart_nominee: null },
  { pick: { id: 'p5', user_id: USER_B.id, year_id: Y, category_id: CAT.director, head_nominee_id: nid('dir', 3), heart_nominee_id: null,          note: null,                        submitted_at: '2026-03-02T08:00:00Z' }, user: USER_B, category: { id: CAT.director, name: 'Directing',                 name_tr: 'En İyi Yönetmen'          }, head_nominee: { id: nid('dir', 3), name: 'Paul Thomas Anderson', film_title: 'One Battle after Another' }, heart_nominee: null },
  { pick: { id: 'p6', user_id: USER_B.id, year_id: Y, category_id: CAT.actor,    head_nominee_id: nid('acm', 2), heart_nominee_id: null,          note: null,                        submitted_at: '2026-03-02T08:00:00Z' }, user: USER_B, category: { id: CAT.actor,    name: 'Actor in a Leading Role',   name_tr: 'En İyi Erkek Oyuncu'     }, head_nominee: { id: nid('acm',2), name: 'Leonardo DiCaprio',  film_title: 'One Battle after Another' }, heart_nominee: null },
  { pick: { id: 'p7', user_id: USER_C.id, year_id: Y, category_id: CAT.picture,  head_nominee_id: nid('pic', 4), heart_nominee_id: nid('pic', 9), note: null,                        submitted_at: '2026-03-01T20:00:00Z' }, user: USER_C, category: { id: CAT.picture,  name: 'Best Picture',              name_tr: 'En İyi Film'              }, head_nominee: { id: nid('pic', 4), name: 'Hamnet',             film_title: null         }, heart_nominee: { id: nid('pic', 9), name: 'Sinners', film_title: null } },
  { pick: { id: 'p8', user_id: USER_C.id, year_id: Y, category_id: CAT.actress,  head_nominee_id: nid('act', 1), heart_nominee_id: null,          note: null,                        submitted_at: '2026-03-01T20:00:00Z' }, user: USER_C, category: { id: CAT.actress,  name: 'Actress in a Leading Role', name_tr: 'En İyi Kadın Oyuncu'     }, head_nominee: { id: nid('act', 1), name: 'Jessie Buckley',    film_title: 'Hamnet'     }, heart_nominee: null },
]

export const MOCK_RESULTS = [
  { rank: 1, user: USER_A, score: 18, heart_correct: 3, accuracy: 75, total_categories: 24 },
  { rank: 2, user: USER_C, score: 15, heart_correct: 1, accuracy: 63, total_categories: 24 },
  { rank: 3, user: USER_B, score: 12, heart_correct: 2, accuracy: 50, total_categories: 24 },
]

// ── 2025 mock data (results state — winners set) ──────────────────────────────

const CAT25 = {
  picture:  'cat25-picture',
  director: 'cat25-director',
  actor:    'cat25-actor',
  actress:  'cat25-actress',
}

function nid25(cat: string, i: number) { return `nom25-${cat}-${i}` }

export const MOCK_CATEGORIES_WITH_NOMINEES_2025 = [
  {
    id: CAT25.picture, year_id: Y25, name: 'Best Picture', name_tr: 'En İyi Film',
    group: 'solo_picture', order_index: 1,
    nominees: [
      { id: nid25('pic', 1), category_id: CAT25.picture, name: 'Anora',           film_title: null, is_winner: true  },
      { id: nid25('pic', 2), category_id: CAT25.picture, name: 'The Brutalist',   film_title: null, is_winner: false },
      { id: nid25('pic', 3), category_id: CAT25.picture, name: 'A Complete Unknown', film_title: null, is_winner: false },
      { id: nid25('pic', 4), category_id: CAT25.picture, name: 'Conclave',        film_title: null, is_winner: false },
      { id: nid25('pic', 5), category_id: CAT25.picture, name: 'Emilia Pérez',    film_title: null, is_winner: false },
    ],
  },
  {
    id: CAT25.director, year_id: Y25, name: 'Directing', name_tr: 'En İyi Yönetmen',
    group: 'solo_director', order_index: 2,
    nominees: [
      { id: nid25('dir', 1), category_id: CAT25.director, name: 'Sean Baker',       film_title: 'Anora',         is_winner: true  },
      { id: nid25('dir', 2), category_id: CAT25.director, name: 'Brady Corbet',     film_title: 'The Brutalist', is_winner: false },
      { id: nid25('dir', 3), category_id: CAT25.director, name: 'James Mangold',    film_title: 'A Complete Unknown', is_winner: false },
      { id: nid25('dir', 4), category_id: CAT25.director, name: 'Jacques Audiard',  film_title: 'Emilia Pérez',  is_winner: false },
      { id: nid25('dir', 5), category_id: CAT25.director, name: 'Coralie Fargeat',  film_title: 'The Substance', is_winner: false },
    ],
  },
  {
    id: CAT25.actor, year_id: Y25, name: 'Actor in a Leading Role', name_tr: 'En İyi Erkek Oyuncu',
    group: 'acting', order_index: 3,
    nominees: [
      { id: nid25('acm', 1), category_id: CAT25.actor, name: 'Adrien Brody',       film_title: 'The Brutalist',      is_winner: true  },
      { id: nid25('acm', 2), category_id: CAT25.actor, name: 'Timothée Chalamet',  film_title: 'A Complete Unknown', is_winner: false },
      { id: nid25('acm', 3), category_id: CAT25.actor, name: 'Colman Domingo',     film_title: 'Sing Sing',          is_winner: false },
      { id: nid25('acm', 4), category_id: CAT25.actor, name: 'Ralph Fiennes',      film_title: 'Conclave',           is_winner: false },
      { id: nid25('acm', 5), category_id: CAT25.actor, name: 'Sebastian Stan',     film_title: 'The Apprentice',     is_winner: false },
    ],
  },
  {
    id: CAT25.actress, year_id: Y25, name: 'Actress in a Leading Role', name_tr: 'En İyi Kadın Oyuncu',
    group: 'acting', order_index: 4,
    nominees: [
      { id: nid25('act', 1), category_id: CAT25.actress, name: 'Demi Moore',       film_title: 'The Substance',  is_winner: true  },
      { id: nid25('act', 2), category_id: CAT25.actress, name: 'Cynthia Erivo',    film_title: 'Wicked',         is_winner: false },
      { id: nid25('act', 3), category_id: CAT25.actress, name: 'Karla Sofía Gascón', film_title: 'Emilia Pérez', is_winner: false },
      { id: nid25('act', 4), category_id: CAT25.actress, name: 'Mikey Madison',    film_title: 'Anora',          is_winner: false },
      { id: nid25('act', 5), category_id: CAT25.actress, name: 'Fernanda Torres',  film_title: 'I\'m Still Here', is_winner: false },
    ],
  },
]

export const MOCK_PICKS_2025 = [
  { pick: { id: 'q1', user_id: USER_A.id, year_id: Y25, category_id: CAT25.picture,  head_nominee_id: nid25('pic', 1), heart_nominee_id: nid25('pic', 2), submitted_at: '2025-03-01T10:00:00Z' }, user: USER_A, category: { id: CAT25.picture,  name: 'Best Picture',            name_tr: 'En İyi Film'         }, head_nominee: { id: nid25('pic', 1), name: 'Anora',         film_title: null        }, heart_nominee: { id: nid25('pic', 2), name: 'The Brutalist', film_title: null } },
  { pick: { id: 'q2', user_id: USER_A.id, year_id: Y25, category_id: CAT25.director, head_nominee_id: nid25('dir', 1), heart_nominee_id: null,           submitted_at: '2025-03-01T10:00:00Z' }, user: USER_A, category: { id: CAT25.director, name: 'Directing',               name_tr: 'En İyi Yönetmen'     }, head_nominee: { id: nid25('dir', 1), name: 'Sean Baker',    film_title: 'Anora'     }, heart_nominee: null },
  { pick: { id: 'q3', user_id: USER_A.id, year_id: Y25, category_id: CAT25.actor,    head_nominee_id: nid25('acm', 2), heart_nominee_id: nid25('acm', 1), submitted_at: '2025-03-01T10:00:00Z' }, user: USER_A, category: { id: CAT25.actor,    name: 'Actor in a Leading Role', name_tr: 'En İyi Erkek Oyuncu' }, head_nominee: { id: nid25('acm', 2), name: 'Timothée Chalamet', film_title: 'A Complete Unknown' }, heart_nominee: { id: nid25('acm', 1), name: 'Adrien Brody', film_title: 'The Brutalist' } },
  { pick: { id: 'q4', user_id: USER_B.id, year_id: Y25, category_id: CAT25.picture,  head_nominee_id: nid25('pic', 2), heart_nominee_id: null,           submitted_at: '2025-03-02T08:00:00Z' }, user: USER_B, category: { id: CAT25.picture,  name: 'Best Picture',            name_tr: 'En İyi Film'         }, head_nominee: { id: nid25('pic', 2), name: 'The Brutalist', film_title: null        }, heart_nominee: null },
  { pick: { id: 'q5', user_id: USER_B.id, year_id: Y25, category_id: CAT25.actor,    head_nominee_id: nid25('acm', 1), heart_nominee_id: null,           submitted_at: '2025-03-02T08:00:00Z' }, user: USER_B, category: { id: CAT25.actor,    name: 'Actor in a Leading Role', name_tr: 'En İyi Erkek Oyuncu' }, head_nominee: { id: nid25('acm', 1), name: 'Adrien Brody',      film_title: 'The Brutalist'      }, heart_nominee: null },
  { pick: { id: 'q6', user_id: USER_C.id, year_id: Y25, category_id: CAT25.picture,  head_nominee_id: nid25('pic', 1), heart_nominee_id: null,           submitted_at: '2025-03-01T20:00:00Z' }, user: USER_C, category: { id: CAT25.picture,  name: 'Best Picture',            name_tr: 'En İyi Film'         }, head_nominee: { id: nid25('pic', 1), name: 'Anora',         film_title: null        }, heart_nominee: null },
  { pick: { id: 'q7', user_id: USER_C.id, year_id: Y25, category_id: CAT25.actress,  head_nominee_id: nid25('act', 1), heart_nominee_id: nid25('act', 1), submitted_at: '2025-03-01T20:00:00Z' }, user: USER_C, category: { id: CAT25.actress,  name: 'Actress in a Leading Role', name_tr: 'En İyi Kadın Oyuncu' }, head_nominee: { id: nid25('act', 1), name: 'Demi Moore', film_title: 'The Substance' }, heart_nominee: { id: nid25('act', 1), name: 'Demi Moore', film_title: 'The Substance' } },
]

export const MOCK_RESULTS_2025 = [
  { rank: 1, user: USER_B, score: 2, heart_correct: 0, accuracy: 50, total_categories: 4 },
  { rank: 2, user: USER_A, score: 2, heart_correct: 1, accuracy: 50, total_categories: 4 },
  { rank: 3, user: USER_C, score: 2, heart_correct: 1, accuracy: 50, total_categories: 4 },
]

// ── Year-aware helpers ────────────────────────────────────────────────────────

export function getMockNominees(year: number) {
  if (year === 2025) return MOCK_CATEGORIES_WITH_NOMINEES_2025
  return MOCK_CATEGORIES_WITH_NOMINEES
}

export function getMockPicks(year: number) {
  if (year === 2025) return MOCK_PICKS_2025
  return MOCK_PICKS
}

export function getMockResults(year: number) {
  if (year === 2025) return MOCK_RESULTS_2025
  return MOCK_RESULTS
}
