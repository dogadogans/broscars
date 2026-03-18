'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Select from '@/components/ui/Select'
import { useTranslation } from '@/hooks/useTranslation'
import type { PickWithDetails, RankedScore, Year, CategoryWithNominees } from '@/types'

const CARD_SHADOW = '0 0 0 1px rgba(173,173,173,0.50)'

// ── Stacked avatars ───────────────────────────────────────────────────────────

function AvatarStack({ users }: { users: { id: string; display_name: string; avatar_color: string }[] }) {
  return (
    <div className="flex shrink-0">
      {users.map((u, i) => (
        <div
          key={u.id}
          className="group relative rounded-full ring-2 ring-white hover:z-[50]"
          style={{ marginLeft: i === 0 ? 0 : '-8px' }}
        >
          <Avatar displayName={u.display_name} color={u.avatar_color} size="sm" />
          <div
            className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ zIndex: 50 }}
          >
            <div
              className="inline-flex items-center rounded-lg px-2 py-1 font-sans text-sm font-medium whitespace-nowrap"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-grey-3)',
                boxShadow: '0px 0px 0px 1px rgba(219,219,219,0.50), 0px 1px 2px 0px rgba(44,41,41,0.08)',
                outline: '1px solid var(--color-border)',
              }}
            >
              {u.display_name}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Group Wall ────────────────────────────────────────────────────────────────

function GroupWall({
  picks,
  nominees,
  locale,
}: {
  picks: PickWithDetails[]
  nominees: CategoryWithNominees[]
  locale: string
}) {
  const { t } = useTranslation()

  const winnerMap = new Map<string, boolean>()
  for (const cat of nominees) {
    for (const n of cat.nominees) winnerMap.set(n.id, n.is_winner)
  }

  // Group by category → nominee
  const byCat = new Map<
    string,
    {
      category: PickWithDetails['category']
      order: number
      nomineeMap: Map<string, { nominee: PickWithDetails['head_nominee']; users: PickWithDetails['user'][] }>
    }
  >()

  for (const p of picks) {
    const cid = p.category.id
    if (!byCat.has(cid)) {
      const order = nominees.findIndex((c) => c.id === cid)
      byCat.set(cid, { category: p.category, order: order >= 0 ? order : 999, nomineeMap: new Map() })
    }
    const entry = byCat.get(cid)!
    const nid = p.head_nominee.id
    if (!entry.nomineeMap.has(nid)) entry.nomineeMap.set(nid, { nominee: p.head_nominee, users: [] })
    entry.nomineeMap.get(nid)!.users.push(p.user)
  }

  // Inject winner nominees that nobody picked so they still appear highlighted
  for (const cat of nominees) {
    for (const n of cat.nominees) {
      if (!n.is_winner) continue
      if (!byCat.has(cat.id)) {
        const order = nominees.findIndex((c) => c.id === cat.id)
        byCat.set(cat.id, { category: { id: cat.id, name: cat.name, name_tr: cat.name_tr }, order, nomineeMap: new Map() })
      }
      const entry = byCat.get(cat.id)!
      if (!entry.nomineeMap.has(n.id)) {
        entry.nomineeMap.set(n.id, { nominee: { id: n.id, name: n.name, film_title: n.film_title ?? null }, users: [] })
      }
    }
  }

  const sorted = [...byCat.values()].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) {
    return (
      <div
        className="rounded-lg px-4 py-10 text-center font-sans text-sm"
        style={{ color: 'var(--color-grey-3)', background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
      >
        {t('wall.empty')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map(({ category, nomineeMap }) => (
        <div
          key={category.id}
          className="rounded-lg"
          style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
        >
          <div className="px-4 pb-2 pt-3">
            <p className="font-sans text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              {locale === 'tr' ? category.name_tr : category.name}
            </p>
          </div>
          <div className="flex flex-col gap-2 pb-2">
            {[...nomineeMap.values()].map(({ nominee, users }) => {
              const isWinner = winnerMap.get(nominee.id) ?? false
              return isWinner ? (
                <div
                  key={nominee.id}
                  className="mx-2 mb-1 flex flex-col gap-1.5 rounded-lg p-2"
                  style={{
                    background: 'var(--color-warning-100)',
                    boxShadow: '0px 0px 0px 2px rgba(185,156,54,1.00), 0px 0px 0px 1px rgba(150,150,150,0.08)',
                  }}
                >
                  <span
                    className="font-sans text-xs font-bold tracking-wide"
                    style={{ color: '#967811' }}
                  >
                    {t('wall.winner')}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans text-sm" style={{ color: 'var(--color-text)' }}>
                        {nominee.name}
                      </span>
                      {nominee.film_title && (
                        <span className="font-sans text-xs italic" style={{ color: 'var(--color-grey-3)' }}>
                          {nominee.film_title}
                        </span>
                      )}
                    </div>
                    <AvatarStack users={users} />
                  </div>
                </div>
              ) : (
                <div
                  key={nominee.id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-sm" style={{ color: 'var(--color-text)' }}>
                      {nominee.name}
                    </span>
                    {nominee.film_title && (
                      <span className="font-sans text-xs italic" style={{ color: 'var(--color-grey-3)' }}>
                        {nominee.film_title}
                      </span>
                    )}
                  </div>
                  <AvatarStack users={users} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

const RANK_COLORS: Record<number, string> = {
  1: '#B99C36',
  2: '#9E9E9E',
  3: '#C0522F',
}

function Leaderboard({ results, isVoting }: { results: RankedScore[] | null; isVoting: boolean }) {
  const { t } = useTranslation()

  if (isVoting || !results) {
    return (
      <div
        className="rounded-lg px-4 py-10 text-center font-sans text-sm"
        style={{ color: 'var(--color-grey-3)', background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
      >
        {t('wall.resultsAfterCeremony')}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-4 overflow-hidden rounded-lg p-3"
      style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
    >
      {results.map((r) => {
        const topBg = RANK_COLORS[r.rank]
        return (
          <div key={r.user.id} className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold"
              style={
                topBg
                  ? { backgroundColor: topBg, color: '#fff', boxShadow: '0 0 0 1px rgba(219,219,219,0.50), 0 1px 2px 0 rgba(44,41,41,0.08)' }
                  : { background: 'var(--color-surface)', color: 'var(--color-text)', boxShadow: '0 0 0 1px rgba(152,150,150,0.50), 0 1px 2px 0 rgba(44,41,41,0.08)' }
              }
            >
              {r.rank}
            </div>
            <span className="flex-1 font-sans text-base font-normal" style={{ color: 'var(--color-text)' }}>
              {r.user.display_name}
            </span>
            <span className="font-sans text-sm font-normal" style={{ color: 'var(--color-text)' }}>
              {r.score}/{r.total_categories}
            </span>
          </div>
        )
      })}
    </div>
  )
}


// ── Tab bar ───────────────────────────────────────────────────────────────────

type Tab = 'wall' | 'leaderboard'

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WallPage() {
  const { year } = useParams()
  const router = useRouter()
  const { t, locale } = useTranslation()

  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) ?? 'wall')
  const [picks, setPicks] = useState<PickWithDetails[]>([])
  const [nominees, setNominees] = useState<CategoryWithNominees[]>([])
  const [results, setResults] = useState<RankedScore[] | null>(null)
  const [years, setYears] = useState<Year[]>([])
  const [yearState, setYearState] = useState<string>('voting')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/${year}/picks`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/${year}/nominees`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/${year}/state`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/years`, { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([picksJson, nomJson, stateJson, yearsJson]) => {
        setPicks(picksJson.data ?? [])
        setNominees(nomJson.data ?? [])
        setYearState(stateJson.data?.state ?? 'voting')
        setYears(yearsJson.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year])

  useEffect(() => {
    if (yearState !== 'results') return
    fetch(`/api/${year}/results`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => setResults(json.data ?? null))
      .catch(() => {})
  }, [yearState, year])


  const isVoting = yearState !== 'results'

  return (
    <div className="px-4">
    <div className="mx-auto w-full max-w-[480px] pb-16 pt-6">
      {/* Tab selector */}
      <div
        className="mb-6 flex h-9 w-full overflow-hidden rounded-lg"
        style={{ boxShadow: '0 0 0 1px rgba(173,173,173,0.50)' }}
      >
        <button
          onClick={() => setTab('wall')}
          className="flex flex-1 items-center justify-center px-3 font-sans text-base transition-colors"
          style={{
            background: tab === 'wall' ? 'var(--grey-05)' : 'var(--color-surface)',
            color: 'var(--color-text)',
            fontWeight: tab === 'wall' ? 500 : 400,
            borderRight: '1px solid rgba(173,173,173,0.50)',
          }}
        >
          {t('wall.heading')}
        </button>
        <button
          onClick={() => setTab('leaderboard')}
          className="flex flex-1 items-center justify-center px-3 font-sans text-base transition-colors"
          style={{
            background: tab === 'leaderboard' ? 'var(--grey-05)' : 'var(--color-surface)',
            color: 'var(--color-text)',
            fontWeight: tab === 'leaderboard' ? 500 : 400,
          }}
        >
          {t('results.leaderboard')}
        </button>
      </div>

      {/* Section header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[26px] font-medium" style={{ color: 'var(--color-text)' }}>
            {tab === 'wall' ? t('wall.heading') : t('results.leaderboard')}
          </h1>
          <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>
            {tab === 'wall' ? t('wall.wallSubtitle') : t('wall.leaderboardSubtitle')}
          </p>
        </div>
        <Select
          value={String(year)}
          onChange={(y) => router.push(`/${y}/wall`)}
          options={years.map((yr) => ({ label: String(yr.year), value: String(yr.year) }))}
        />
      </div>

      {loading ? (
        <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>
          {t('common.loading')}
        </p>
      ) : tab === 'wall' ? (
        <GroupWall picks={picks} nominees={nominees} locale={locale} />
      ) : (
        <Leaderboard results={results} isVoting={isVoting} />
      )}

    </div>
    </div>
  )
}
