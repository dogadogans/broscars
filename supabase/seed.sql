-- ============================================================
-- Broscars — 2026 Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- ============================================================

DO $$
DECLARE
  y_id  uuid;

  cat_picture     uuid;
  cat_director    uuid;
  cat_actor       uuid;
  cat_supactor    uuid;
  cat_actress     uuid;
  cat_supactress  uuid;
  cat_casting     uuid;
  cat_animated    uuid;
  cat_docfeat     uuid;
  cat_intl        uuid;
  cat_adaptscr    uuid;
  cat_origscr     uuid;
  cat_cinemato    uuid;
  cat_editing     uuid;
  cat_score       uuid;
  cat_sound       uuid;
  cat_origsong    uuid;
  cat_vfx         uuid;
  cat_proddesign  uuid;
  cat_costume     uuid;
  cat_makeup      uuid;
  cat_animshort   uuid;
  cat_liveaction  uuid;
  cat_docshort    uuid;

BEGIN

  -- ── Year ────────────────────────────────────────────────────
  INSERT INTO years (year, state)
    VALUES (2026, 'voting')
    RETURNING id INTO y_id;

  -- ── Categories ──────────────────────────────────────────────
  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Best Picture',                    'En İyi Film',                      'solo_picture',  1)
    RETURNING id INTO cat_picture;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Directing',                        'En İyi Yönetmen',                  'solo_director', 2)
    RETURNING id INTO cat_director;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Actor in a Leading Role',          'En İyi Erkek Oyuncu',              'acting',        3)
    RETURNING id INTO cat_actor;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Actor in a Supporting Role',       'En İyi Yardımcı Erkek Oyuncu',    'acting',        4)
    RETURNING id INTO cat_supactor;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Actress in a Leading Role',        'En İyi Kadın Oyuncu',              'acting',        5)
    RETURNING id INTO cat_actress;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Actress in a Supporting Role',     'En İyi Yardımcı Kadın Oyuncu',    'acting',        6)
    RETURNING id INTO cat_supactress;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Casting',                          'En İyi Oyuncu Seçimi',             'acting',        7)
    RETURNING id INTO cat_casting;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Animated Feature Film',            'En İyi Animasyon Filmi',           'features',      8)
    RETURNING id INTO cat_animated;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Documentary Feature Film',         'En İyi Belgesel Film',             'features',      9)
    RETURNING id INTO cat_docfeat;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'International Feature Film',       'En İyi Uluslararası Film',         'features',      10)
    RETURNING id INTO cat_intl;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Writing (Adapted Screenplay)',     'En İyi Uyarlama Senaryo',          'writing',       11)
    RETURNING id INTO cat_adaptscr;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Writing (Original Screenplay)',    'En İyi Orijinal Senaryo',          'writing',       12)
    RETURNING id INTO cat_origscr;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Cinematography',                   'Görüntü Yönetimi',                 'craft_sound',   13)
    RETURNING id INTO cat_cinemato;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Film Editing',                     'Film Kurgusu',                     'craft_sound',   14)
    RETURNING id INTO cat_editing;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Music (Original Score)',           'Orijinal Müzik',                   'craft_sound',   15)
    RETURNING id INTO cat_score;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Sound',                            'Ses',                              'craft_sound',   16)
    RETURNING id INTO cat_sound;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Music (Original Song)',            'Orijinal Şarkı',                   'craft_sound',   17)
    RETURNING id INTO cat_origsong;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Visual Effects',                   'Görsel Efektler',                  'craft_sound',   18)
    RETURNING id INTO cat_vfx;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Production Design',                'Prodüksiyon Tasarımı',             'craft_sound',   19)
    RETURNING id INTO cat_proddesign;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Costume Design',                   'Kostüm Tasarımı',                  'craft_sound',   20)
    RETURNING id INTO cat_costume;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Makeup and Hairstyling',           'Makyaj & Saç Tasarımı',            'craft_sound',   21)
    RETURNING id INTO cat_makeup;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Animated Short Film',              'En İyi Animasyon Kısa Film',       'shorts',        22)
    RETURNING id INTO cat_animshort;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Live Action Short Film',           'En İyi Kısa Film',                 'shorts',        23)
    RETURNING id INTO cat_liveaction;

  INSERT INTO categories (year_id, name, name_tr, "group", order_index) VALUES
    (y_id, 'Documentary Short Film',           'En İyi Belgesel Kısa Film',        'shorts',        24)
    RETURNING id INTO cat_docshort;

  -- ── Nominees ────────────────────────────────────────────────

  -- Best Picture
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_picture, 'Bugonia',                 null),
    (cat_picture, 'F1',                      null),
    (cat_picture, 'Frankenstein',            null),
    (cat_picture, 'Hamnet',                  null),
    (cat_picture, 'Marty Supreme',           null),
    (cat_picture, 'One Battle after Another',null),
    (cat_picture, 'The Secret Agent',        null),
    (cat_picture, 'Sentimental Value',       null),
    (cat_picture, 'Sinners',                 null),
    (cat_picture, 'Train Dreams',            null);

  -- Directing
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_director, 'Chloé Zhao',           'Hamnet'),
    (cat_director, 'Josh Safdie',           'Marty Supreme'),
    (cat_director, 'Paul Thomas Anderson',  'One Battle after Another'),
    (cat_director, 'Joachim Trier',         'Sentimental Value'),
    (cat_director, 'Ryan Coogler',          'Sinners');

  -- Actor in a Leading Role
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_actor, 'Timothée Chalamet',  'Marty Supreme'),
    (cat_actor, 'Leonardo DiCaprio',  'One Battle after Another'),
    (cat_actor, 'Ethan Hawke',        'Blue Moon'),
    (cat_actor, 'Michael B. Jordan',  'Sinners'),
    (cat_actor, 'Wagner Moura',       'The Secret Agent');

  -- Actor in a Supporting Role
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_supactor, 'Benicio Del Toro',   'One Battle after Another'),
    (cat_supactor, 'Jacob Elordi',       'Frankenstein'),
    (cat_supactor, 'Delroy Lindo',       'Sinners'),
    (cat_supactor, 'Sean Penn',          'One Battle after Another'),
    (cat_supactor, 'Stellan Skarsgård', 'Sentimental Value');

  -- Actress in a Leading Role
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_actress, 'Jessie Buckley',  'Hamnet'),
    (cat_actress, 'Rose Byrne',      'If I Had Legs I''d Kick You'),
    (cat_actress, 'Kate Hudson',     'Song Sung Blue'),
    (cat_actress, 'Renate Reinsve',  'Sentimental Value'),
    (cat_actress, 'Emma Stone',      'Bugonia');

  -- Actress in a Supporting Role
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_supactress, 'Elle Fanning',             'Sentimental Value'),
    (cat_supactress, 'Inga Ibsdotter Lilleaas',  'Sentimental Value'),
    (cat_supactress, 'Amy Madigan',              'Weapons'),
    (cat_supactress, 'Wunmi Mosaku',             'Sinners'),
    (cat_supactress, 'Teyana Taylor',            'One Battle after Another');

  -- Casting
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_casting, 'Nina Gold',            'Hamnet'),
    (cat_casting, 'Jennifer Venditti',    'Marty Supreme'),
    (cat_casting, 'Cassandra Kulukundis', 'One Battle after Another'),
    (cat_casting, 'Gabriel Domingues',   'The Secret Agent'),
    (cat_casting, 'Francine Maisler',    'Sinners');

  -- Animated Feature Film
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_animated, 'Arco',                                   null),
    (cat_animated, 'Elio',                                   null),
    (cat_animated, 'KPop Demon Hunters',                     null),
    (cat_animated, 'Little Amélie or the Character of Rain', null),
    (cat_animated, 'Zootopia 2',                             null);

  -- Documentary Feature Film
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_docfeat, 'The Alabama Solution',            null),
    (cat_docfeat, 'Come See Me in the Good Light',   null),
    (cat_docfeat, 'Cutting through Rocks',           null),
    (cat_docfeat, 'Mr. Nobody against Putin',        null),
    (cat_docfeat, 'The Perfect Neighbor',            null);

  -- International Feature Film
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_intl, 'Brazil',  'The Secret Agent'),
    (cat_intl, 'France',  'It Was Just an Accident'),
    (cat_intl, 'Norway',  'Sentimental Value'),
    (cat_intl, 'Spain',   'Sirāt'),
    (cat_intl, 'Tunisia', 'The Voice of Hind Rajab');

  -- Writing (Adapted Screenplay)
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_adaptscr, 'Bugonia',                  'Will Tracy'),
    (cat_adaptscr, 'Frankenstein',             'Guillermo del Toro'),
    (cat_adaptscr, 'Hamnet',                   'Chloé Zhao & Maggie O''Farrell'),
    (cat_adaptscr, 'One Battle after Another', 'Paul Thomas Anderson'),
    (cat_adaptscr, 'Train Dreams',             'Clint Bentley & Greg Kwedar');

  -- Writing (Original Screenplay)
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_origscr, 'Blue Moon',               'Robert Kaplow'),
    (cat_origscr, 'It Was Just an Accident', 'Jafar Panahi'),
    (cat_origscr, 'Marty Supreme',           'Ronald Bronstein & Josh Safdie'),
    (cat_origscr, 'Sentimental Value',       'Eskil Vogt, Joachim Trier'),
    (cat_origscr, 'Sinners',                 'Ryan Coogler');

  -- Cinematography
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_cinemato, 'Dan Laustsen',           'Frankenstein'),
    (cat_cinemato, 'Darius Khondji',         'Marty Supreme'),
    (cat_cinemato, 'Michael Bauman',         'One Battle after Another'),
    (cat_cinemato, 'Autumn Durald Arkapaw',  'Sinners'),
    (cat_cinemato, 'Adolpho Veloso',         'Train Dreams');

  -- Film Editing
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_editing, 'Stephen Mirrione',                'F1'),
    (cat_editing, 'Ronald Bronstein & Josh Safdie',  'Marty Supreme'),
    (cat_editing, 'Andy Jurgensen',                  'One Battle after Another'),
    (cat_editing, 'Olivier Bugge Coutté',            'Sentimental Value'),
    (cat_editing, 'Michael P. Shawver',              'Sinners');

  -- Music (Original Score)
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_score, 'Jerskin Fendrix',   'Bugonia'),
    (cat_score, 'Alexandre Desplat', 'Frankenstein'),
    (cat_score, 'Max Richter',       'Hamnet'),
    (cat_score, 'Jonny Greenwood',   'One Battle after Another'),
    (cat_score, 'Ludwig Goransson',  'Sinners');

  -- Sound
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_sound, 'F1',                       null),
    (cat_sound, 'Frankenstein',             null),
    (cat_sound, 'One Battle after Another', null),
    (cat_sound, 'Sinners',                  null),
    (cat_sound, 'Sirāt',                    null);

  -- Music (Original Song)
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_origsong, 'Dear Me',           'Diane Warren: Relentless'),
    (cat_origsong, 'Golden',            'KPop Demon Hunters'),
    (cat_origsong, 'I Lied To You',     'Sinners'),
    (cat_origsong, 'Sweet Dreams Of Joy','Viva Verdi!'),
    (cat_origsong, 'Train Dreams',      'Train Dreams');

  -- Visual Effects
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_vfx, 'Avatar: Fire and Ash',  null),
    (cat_vfx, 'F1',                    null),
    (cat_vfx, 'Jurassic World Rebirth',null),
    (cat_vfx, 'The Lost Bus',          null),
    (cat_vfx, 'Sinners',               null);

  -- Production Design
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_proddesign, 'Frankenstein',             null),
    (cat_proddesign, 'Hamnet',                   null),
    (cat_proddesign, 'Marty Supreme',            null),
    (cat_proddesign, 'One Battle after Another', null),
    (cat_proddesign, 'Sinners',                  null);

  -- Costume Design
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_costume, 'Deborah L. Scott',   'Avatar: Fire and Ash'),
    (cat_costume, 'Kate Hawley',        'Frankenstein'),
    (cat_costume, 'Malgosia Turzanska', 'Hamnet'),
    (cat_costume, 'Miyako Bellizzi',    'Marty Supreme'),
    (cat_costume, 'Ruth E. Carter',     'Sinners');

  -- Makeup and Hairstyling
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_makeup, 'Frankenstein',         null),
    (cat_makeup, 'Kokuho',               null),
    (cat_makeup, 'Sinners',              null),
    (cat_makeup, 'The Smashing Machine', null),
    (cat_makeup, 'The Ugly Stepsister',  null);

  -- Animated Short Film
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_animshort, 'Butterfly',                 null),
    (cat_animshort, 'Forevergreen',              null),
    (cat_animshort, 'The Girl Who Cried Pearls', null),
    (cat_animshort, 'Retirement Plan',           null),
    (cat_animshort, 'The Three Sisters',         null);

  -- Live Action Short Film
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_liveaction, 'Butcher''s Stain',                  null),
    (cat_liveaction, 'A Friend of Dorothy',               null),
    (cat_liveaction, 'Jane Austen''s Period Drama',       null),
    (cat_liveaction, 'The Singers',                       null),
    (cat_liveaction, 'Two People Exchanging Saliva',      null);

  -- Documentary Short Film
  INSERT INTO nominees (category_id, name, film_title) VALUES
    (cat_docshort, 'All the Empty Rooms',                                          null),
    (cat_docshort, 'Armed Only with a Camera: The Life and Death of Brent Renaud', null),
    (cat_docshort, 'Children No More: "Were and Are Gone"',                        null),
    (cat_docshort, 'The Devil Is Busy',                                            null),
    (cat_docshort, 'Perfectly a Strangeness',                                      null);

END $$;
