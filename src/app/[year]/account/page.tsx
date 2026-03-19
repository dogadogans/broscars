'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Heart, LogOut } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Select from '@/components/ui/Select'
import { getAvatarColor } from '@/lib/utils/avatar'
import { useDeviceToken } from '@/hooks/useDeviceToken'
import { useTranslation } from '@/hooks/useTranslation'
import type { RankedScore, AllTimeRankedScore, PickWithDetails, CategoryWithNominees, Year } from '@/types'

const NAME_KEY  = 'broscar_display_name'
const TOKEN_KEY = 'broscar_token'
const COLOR_KEY = 'broscar_avatar_color'

type Tab = 'stats' | 'picks'


const CARD_SHADOW = '0 0 0 1px rgba(173,173,173,0.50)'

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  if (accent) {
    // "12/82" style — first token in warning color
    const slash = value.indexOf('/')
    const before = slash >= 0 ? value.slice(0, slash) : value
    const after  = slash >= 0 ? value.slice(slash)    : ''
    return (
      <div
        className="rounded-lg px-4 py-4"
        style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
      >
        <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>{label}</p>
        <p className="mt-1 font-sans text-2xl font-bold">
          <span style={{ color: 'var(--color-warning-600)' }}>{before}</span>
          {after && <span style={{ color: 'var(--color-grey-3)' }}>{after}</span>}
        </p>
      </div>
    )
  }
  return (
    <div
      className="rounded-lg px-4 py-4"
      style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
    >
      <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>{label}</p>
      <p className="mt-1 font-sans text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
        {value}
      </p>
    </div>
  )
}

// ── Section header (title + year select) ──────────────────────────────────────

function SectionHeader({
  title,
  selectedYear,
  yearOptions,
  onYearChange,
}: {
  title: string
  selectedYear: string
  yearOptions: { label: string; value: string }[]
  onYearChange: (y: string) => void
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h1 className="font-serif text-[26px] font-medium" style={{ color: 'var(--color-text)' }}>
        {title}
      </h1>
      {yearOptions.length > 0 && (
        <Select value={selectedYear} onChange={onYearChange} options={yearOptions} />
      )}
    </div>
  )
}

// ── My Stats tab ──────────────────────────────────────────────────────────────

function StatsTab({
  selectedYear,
  statsYear,
  statsYearOptions,
  onStatsYearChange,
  yearState,
  myScore,
  allTimeScore,
  myPicksCount,
  totalCategories,
  seasonsJoined,
  loading,
}: {
  selectedYear: string
  statsYear: string
  statsYearOptions: { label: string; value: string }[]
  onStatsYearChange: (y: string) => void
  yearState: string
  myScore: RankedScore | null
  allTimeScore: AllTimeRankedScore | null
  myPicksCount: number
  totalCategories: number
  seasonsJoined: number
  loading: boolean
}) {
  const { t } = useTranslation()
  const isAllTime = statsYear === 'all-time'
  const isVoting = yearState === 'voting'

  return (
    <>
      <SectionHeader
        title={t('account.myStats')}
        selectedYear={statsYear}
        yearOptions={statsYearOptions}
        onYearChange={onStatsYearChange}
      />

      {loading && !isAllTime ? (
        <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>{t('common.loading')}</p>
      ) : (
        <>
          {/* Voting progress card — only for specific year view */}
          {!isAllTime && isVoting && myPicksCount < totalCategories && (
            <div
              className="mb-4 overflow-hidden rounded-lg"
              style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-sans text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                  Oscars {selectedYear}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: 'var(--color-accent)' }}
                    aria-hidden
                  />
                  <span className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>
                    {t('account.votingOpen')}
                  </span>
                </div>
              </div>
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div>
                  <p className="font-sans text-base font-medium" style={{ color: 'var(--color-text)' }}>
                    {myPicksCount}/{totalCategories}
                  </p>
                  <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>
                    {t('account.answered')}
                  </p>
                </div>
                <a
                  href={`/${selectedYear}/vote`}
                  className="flex h-10 items-center rounded-lg px-5 font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--color-grey-5)' }}
                >
                  {t('account.continueVoting')}
                </a>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label={t('account.totalScore')}
              value={
                isAllTime
                  ? (allTimeScore ? String(allTimeScore.total_score) : '—')
                  : (myScore ? `${myScore.score}/${myScore.total_categories}` : `—/${totalCategories || '—'}`)
              }
              accent
            />
            <StatCard
              label={t('account.rank')}
              value={
                isAllTime
                  ? (allTimeScore ? `#${allTimeScore.rank}` : '—')
                  : (myScore ? `#${myScore.rank}` : '—')
              }
            />
            <StatCard
              label={t('account.seasonsJoined')}
              value={String(seasonsJoined || '—')}
            />
            <StatCard
              label={t('account.accuracy')}
              value={
                isAllTime
                  ? '—'
                  : (myScore ? `${myScore.accuracy}%` : '—')
              }
            />
          </div>
        </>
      )}
    </>
  )
}

// ── My Picks tab ──────────────────────────────────────────────────────────────

function PicksTab({
  selectedYear,
  yearOptions,
  onYearChange,
  myScore,
  picks,
  winnerMap,
  loading,
}: {
  selectedYear: string
  yearOptions: { label: string; value: string }[]
  onYearChange: (y: string) => void
  myScore: RankedScore | null
  picks: PickWithDetails[]
  winnerMap: Map<string, boolean>
  loading: boolean
}) {
  const { t } = useTranslation()

  return (
    <>
      <SectionHeader
        title={t('account.myPicks')}
        selectedYear={selectedYear}
        yearOptions={yearOptions}
        onYearChange={onYearChange}
      />

      {loading ? (
        <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>{t('common.loading')}</p>
      ) : picks.length === 0 ? (
        <div
          className="rounded-lg px-4 py-10 text-center font-sans text-sm"
          style={{ color: 'var(--color-grey-3)', background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
        >
          {t('account.noPicks')}
        </div>
      ) : (
        <>
          {/* Summary card */}
          <div
            className="mb-4 grid grid-cols-2 overflow-hidden rounded-lg"
            style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
          >
            <div className="px-4 py-4" style={{ borderRight: '1px solid var(--color-border)' }}>
              <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>{t('account.totalScore')}</p>
              <p className="mt-1 font-sans text-2xl font-bold">
                {myScore ? (
                  <>
                    <span style={{ color: 'var(--color-warning-600)' }}>{myScore.score}</span>
                    <span style={{ color: 'var(--color-grey-3)' }}>/{myScore.total_categories}</span>
                  </>
                ) : (
                  <span style={{ color: 'var(--color-grey-3)' }}>—</span>
                )}
              </p>
            </div>
            <div className="px-4 py-4">
              <p className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>{t('account.rank')}</p>
              <p
                className="mt-1 font-sans text-2xl font-bold"
                style={{ color: 'var(--color-text)' }}
              >
                {myScore ? `#${myScore.rank}` : '—'}
              </p>
            </div>
          </div>

          {/* Picks list */}
          <div
            className="flex flex-col gap-3 overflow-hidden rounded-lg p-2"
            style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
          >
            {picks.map((p) => {
              const isWinner = winnerMap.get(p.head_nominee.id) ?? false

              if (isWinner) {
                return (
                  <div
                    key={p.pick.id}
                    className="overflow-hidden rounded-lg px-3 py-2.5"
                    style={{
                      background: 'var(--color-warning-100)',
                      boxShadow: '0px 0px 0px 2px rgba(185,156,54,1.00)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-sans text-xs" style={{ color: '#967811' }}>
                        {p.category.name}
                      </p>
                      <span className="font-sans text-xs font-bold tracking-wide" style={{ color: '#967811' }}>
                        {t('account.winner')}
                      </span>
                    </div>
                    <p className="mt-0.5 font-sans text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {p.head_nominee.name}
                    </p>
                    {p.head_nominee.film_title && (
                      <p className="font-sans text-xs italic" style={{ color: 'var(--color-grey-3)' }}>
                        {p.head_nominee.film_title}
                      </p>
                    )}
                    {p.heart_nominee && (
                      <div className="mt-1 flex items-center gap-1">
                        <Heart
                          size={12}
                          fill='var(--color-danger-500)'
                          style={{ color: 'var(--color-danger-500)', flexShrink: 0 }}
                        />
                        <span className="font-sans text-sm" style={{ color: 'var(--color-danger-500)' }}>
                          {p.heart_nominee.name}
                        </span>
                        {p.heart_nominee.film_title && (
                          <span className="font-sans text-xs italic" style={{ color: 'var(--color-danger-400)' }}>
                            — {p.heart_nominee.film_title}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <div
                  key={p.pick.id}
                  className="px-4 py-2.5"
                >
                  <p className="font-sans text-xs" style={{ color: 'var(--color-grey-3)' }}>
                    {p.category.name}
                  </p>
                  <p className="mt-0.5 font-sans text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {p.head_nominee.name}
                  </p>
                  {p.head_nominee.film_title && (
                    <p className="font-sans text-xs italic" style={{ color: 'var(--color-grey-3)' }}>
                      {p.head_nominee.film_title}
                    </p>
                  )}
                  {p.heart_nominee && (
                    <div className="mt-1 flex items-center gap-1">
                      <Heart
                        size={12}
                        fill='var(--color-danger-500)'
                        style={{ color: 'var(--color-danger-500)', flexShrink: 0 }}
                      />
                      <span className="font-sans text-sm" style={{ color: 'var(--color-danger-500)' }}>
                        {p.heart_nominee.name}
                      </span>
                      {p.heart_nominee.film_title && (
                        <span className="font-sans text-xs italic" style={{ color: 'var(--color-danger-400)' }}>
                          — {p.heart_nominee.film_title}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { year: paramYear } = useParams<{ year: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useDeviceToken()
  const { t } = useTranslation()

  const [displayName, setDisplayName]       = useState<string | null>(null)
  const [avatarColor, setAvatarColor]       = useState<string | null>(null)
  const [tab, setTab]                       = useState<Tab>(searchParams.get('tab') === 'picks' ? 'picks' : 'stats')
  const [years, setYears]                   = useState<Year[]>([])
  const [selectedYear, setSelectedYear]     = useState(paramYear)
  const [statsYear, setStatsYear]           = useState<string>(paramYear)
  const [allTimeScore, setAllTimeScore]     = useState<AllTimeRankedScore | null>(null)

  // Per-year data
  const [yearState, setYearState]           = useState<string>('voting')
  const [myScore, setMyScore]               = useState<RankedScore | null>(null)
  const [myPicksCount, setMyPicksCount]     = useState(0)
  const [totalCategories, setTotalCategories] = useState(0)
  const [nominees, setNominees]             = useState<CategoryWithNominees[]>([])
  const [myPicks, setMyPicks]               = useState<PickWithDetails[]>([])
  const [loadingYear, setLoadingYear]       = useState(true)

  // All-time
  const [seasonsJoined, setSeasonsJoined]   = useState(0)
  const [logoutHovered, setLogoutHovered]   = useState(false)

  // Fetch all-time scores once
  useEffect(() => {
    if (!displayName) return
    fetch('/api/all-time', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        const entries: AllTimeRankedScore[] = json.data ?? []
        setAllTimeScore(entries.find((e) => e.user.display_name === displayName) ?? null)
      })
      .catch(() => {})
  }, [displayName])

  // Initialize: read name, fetch years
  useEffect(() => {
    const name = localStorage.getItem(NAME_KEY)
    if (!name) { router.replace('/join'); return }
    setDisplayName(name)
    setAvatarColor(localStorage.getItem(COLOR_KEY))

    fetch('/api/years')
      .then((r) => r.json())
      .then((json) => {
        const all: Year[] = json.data ?? []
        setYears(all)

        // Count seasons joined in parallel
        Promise.all(
          all.map((y) =>
            fetch(`/api/${y.year}/picks`)
              .then((r) => r.json())
              .then((j) => {
                const picks: PickWithDetails[] = j.data ?? []
                return picks.some((p) => p.user.display_name === name) ? 1 : 0
              })
              .catch(() => 0)
          )
        ).then((counts) => setSeasonsJoined(counts.reduce((a, b) => a + b, 0)))
      })
      .catch(() => {})
  }, [paramYear, router])

  // Fetch data whenever selectedYear, displayName, or token changes
  useEffect(() => {
    if (!displayName || !token) return
    setLoadingYear(true)

    Promise.all([
      fetch(`/api/${selectedYear}/state`).then((r) => r.json()),
      fetch(`/api/${selectedYear}/my-picks`, {
        headers: { 'x-device-token': token },
      }).then((r) => r.json()),
      fetch(`/api/${selectedYear}/nominees`).then((r) => r.json()),
    ])
      .then(async ([stateJson, myPicksJson, nomJson]) => {
        const state: string = stateJson.data?.state ?? 'voting'
        setYearState(state)

        let mine: PickWithDetails[] = myPicksJson.data?.picks ?? []

        // Token mismatch fallback: if my-picks returned empty, look up picks
        // from the public endpoint filtered by display name
        if (mine.length === 0) {
          const allPicksJson = await fetch(`/api/${selectedYear}/picks`, { cache: 'no-store' }).then((r) => r.json())
          const allPicks: PickWithDetails[] = allPicksJson.data ?? []
          mine = allPicks.filter((p) => p.user.display_name === displayName)
        }

        setMyPicks(mine)
        setMyPicksCount(mine.length)

        const noms: CategoryWithNominees[] = nomJson.data ?? []
        setNominees(noms)
        setTotalCategories(noms.length)

        if (state === 'results' || state === 'offseason') {
          const resultsJson = await fetch(`/api/${selectedYear}/results`).then((r) => r.json())
          const results: RankedScore[] = resultsJson.data ?? []
          setMyScore(results.find((r) => r.user.display_name === displayName) ?? null)
        } else {
          setMyScore(null)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingYear(false))
  }, [selectedYear, displayName, token])

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(NAME_KEY)
    window.dispatchEvent(new Event('broscar:auth'))
    router.push('/')
  }

  if (!displayName) return null

  const yearOptions = years.map((y) => ({ label: String(y.year), value: String(y.year) }))
  const statsYearOptions = [{ label: t('wall.allTime'), value: 'all-time' }, ...yearOptions]

  function handleStatsYearChange(y: string) {
    setStatsYear(y)
    if (y !== 'all-time') setSelectedYear(y)
  }

  // Winner lookup map
  const winnerMap = new Map<string, boolean>()
  for (const cat of nominees) for (const n of cat.nominees) winnerMap.set(n.id, n.is_winner)

  // Sort picks by category order
  const sortedPicks = [...myPicks].sort((a, b) => {
    const ai = nominees.findIndex((n) => n.id === a.category.id)
    const bi = nominees.findIndex((n) => n.id === b.category.id)
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi)
  })

  return (
    <div className="px-4">
    <div className="mx-auto w-full max-w-[480px] pb-16 pt-6">
      {/* Profile header */}
      <div
        className="mb-6 flex items-center justify-between rounded-lg px-4 py-3"
        style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center gap-3">
          <Avatar displayName={displayName} color={avatarColor ?? getAvatarColor(displayName)} size="md" />
          <p className="font-sans text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
            {displayName}
          </p>
        </div>
        <button
          onClick={handleLogout}
          aria-label={t('account.logout')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
          style={{
            background: logoutHovered ? 'var(--color-bg)' : 'var(--color-surface)',
            boxShadow: logoutHovered
              ? '0 0 0 1px rgba(152,150,150,1.00), 0 1px 2px rgba(44,41,41,0.08)'
              : '0 0 0 1px rgba(152,150,150,0.50), 0 1px 2px rgba(44,41,41,0.08)',
          }}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
        >
          <LogOut size={16} aria-hidden style={{ color: 'var(--color-grey-4)' }} />
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="mb-6 flex h-9 w-full overflow-hidden rounded-lg"
        style={{ boxShadow: '0 0 0 1px rgba(173,173,173,0.50)' }}
      >
        {(['stats', 'picks'] as Tab[]).map((tabKey, i) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className="flex flex-1 items-center justify-center px-3 font-sans text-base transition-colors"
            style={{
              background: tab === tabKey ? 'var(--grey-05)' : 'var(--color-surface)',
              color: 'var(--color-text)',
              fontWeight: tab === tabKey ? 500 : 400,
              borderRight: i === 0 ? '1px solid rgba(173,173,173,0.50)' : undefined,
            }}
          >
            {tabKey === 'stats' ? t('account.myStats') : t('account.myPicks')}
          </button>
        ))}
      </div>

      {tab === 'stats' ? (
        <StatsTab
          selectedYear={selectedYear}
          statsYear={statsYear}
          statsYearOptions={statsYearOptions}
          onStatsYearChange={handleStatsYearChange}
          yearState={yearState}
          myScore={myScore}
          allTimeScore={allTimeScore}
          myPicksCount={myPicksCount}
          totalCategories={totalCategories}
          seasonsJoined={seasonsJoined}
          loading={loadingYear}
        />
      ) : (
        <PicksTab
          selectedYear={selectedYear}
          yearOptions={yearOptions}
          onYearChange={setSelectedYear}
          myScore={myScore}
          picks={sortedPicks}
          winnerMap={winnerMap}
          loading={loadingYear}
        />
      )}

    </div>
    </div>
  )
}
