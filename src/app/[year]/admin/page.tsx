'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import type { CategoryWithNominees, GameState } from '@/types'

const CARD_SHADOW_DEFAULT  = '0 0 0 1px rgba(173,173,173,0.50)'
const CARD_SHADOW_SELECTED = '0 0 0 2px rgba(185,156,54,1.00)'
const CARD_SHADOW_HOVER    = '0 0 0 1px rgba(185,156,54,0.50)'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-grey-2)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
}

// ── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: (pw: string) => void }) {
  const [password, setPassword] = useState('')
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-24">
      <h1 className="mb-2 font-serif text-3xl font-medium" style={{ color: 'var(--color-text)' }}>
        {t('admin.heading')}
      </h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--color-grey-3)' }}>
        {t('admin.passwordHint')}
      </p>
      <div className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && password.trim()) onUnlock(password.trim()) }}
          placeholder={t('admin.passwordPlaceholder')}
          autoFocus
          style={inputStyle}
        />
        <Button onClick={() => { if (password.trim()) onUnlock(password.trim()) }} disabled={!password.trim()}>
          {t('admin.unlock')}
        </Button>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1 font-serif text-xl font-medium" style={{ color: 'var(--color-text)' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mb-4 text-sm" style={{ color: 'var(--color-grey-3)' }}>{subtitle}</p>
      )}
      {children}
    </div>
  )
}

function StatusMsg({ msg }: { msg: { text: string; ok: boolean } | null }) {
  if (!msg) return null
  return (
    <p className="mt-3 text-sm" style={{ color: msg.ok ? 'var(--color-success-400, green)' : 'var(--color-danger-500)' }}>
      {msg.text}
    </p>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { year } = useParams()
  const [password, setPassword] = useState<string | null>(null)
  const { t } = useTranslation()

  if (!password) return <PasswordGate onUnlock={setPassword} />

  return (
    <div className="mx-auto w-full max-w-xl space-y-10 px-4 py-10">
      <div>
        <h1 className="font-serif text-3xl font-medium" style={{ color: 'var(--color-text)' }}>
          {t('admin.heading')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-grey-3)' }}>Oscars {year}</p>
      </div>

      <hr style={{ borderColor: 'var(--color-grey-2)' }} />
      <LoadNomineesSection year={year as string} password={password} />

      <hr style={{ borderColor: 'var(--color-grey-2)' }} />
      <GameStateSection year={year as string} password={password} />

      <hr style={{ borderColor: 'var(--color-grey-2)' }} />
      <WinnersSection year={year as string} password={password} />
    </div>
  )
}

// ── Section 1: Load Nominees ──────────────────────────────────────────────────

const NOMINEES_PLACEHOLDER = `[
  {
    "name": "Best Picture",
    "name_tr": "En İyi Film",
    "group": "solo_picture",
    "order_index": 0,
    "nominees": [
      { "name": "Film A", "film_title": "Film A" },
      { "name": "Film B", "film_title": "Film B" }
    ]
  }
]`

function LoadNomineesSection({ year, password }: { year: string; password: string }) {
  const [json, setJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null)
  const { t } = useTranslation()

  async function handleLoad() {
    setStatus(null)
    let categories
    try {
      categories = JSON.parse(json)
    } catch {
      setStatus({ text: t('admin.invalidJson'), ok: false })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/${year}/admin/nominees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ categories }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setStatus({ text: data.error ?? t('admin.failed'), ok: false })
      } else {
        setStatus({ text: t('admin.loadedCategories', { count: data.data.categories, year: data.data.year }), ok: true })
        setJson('')
      }
    } catch {
      setStatus({ text: t('admin.networkError'), ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title={t('admin.nomineesSection')} subtitle={t('admin.nomineesSubtitle')}>
      <div className="flex flex-col gap-3">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder={NOMINEES_PLACEHOLDER}
          rows={10}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
        />
        <Button onClick={handleLoad} disabled={loading || !json.trim()}>
          {loading ? t('admin.loading') : t('admin.loadNominees')}
        </Button>
      </div>
      <StatusMsg msg={status} />
    </Section>
  )
}

// ── Section 2: Game State ─────────────────────────────────────────────────────

const STATES: { value: GameState; labelKey: string; descKey: string }[] = [
  { value: 'voting',    labelKey: 'admin.votingLabel',   descKey: 'admin.votingDesc'   },
  { value: 'results',  labelKey: 'admin.resultsLabel',  descKey: 'admin.resultsDesc'  },
  { value: 'offseason',labelKey: 'admin.offseasonLabel', descKey: 'admin.offseasonDesc' },
]

function StateCard({
  label, description, selected, disabled, onClick,
}: {
  label: string; description: string; selected: boolean; disabled: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const shadow = selected ? CARD_SHADOW_SELECTED : hovered ? CARD_SHADOW_HOVER : CARD_SHADOW_DEFAULT
  const bg = selected ? 'var(--color-warning-100)' : hovered ? '#FDFDF5' : 'var(--color-surface)'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-1 items-center gap-3 rounded-lg p-3 text-left transition-all disabled:cursor-default"
      style={{ background: bg, boxShadow: shadow }}
    >
      {/* Radio dot */}
      <div className="relative h-5 w-5 shrink-0">
        {selected ? (
          <>
            <div className="absolute inset-[2px] rounded-full bg-gold-600" />
            <div className="absolute left-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-white" />
          </>
        ) : (
          <div
            className="absolute inset-[2px] rounded-full border-2 transition-colors"
            style={{ borderColor: hovered ? '#B99C36' : 'var(--color-grey-2)' }}
          />
        )}
      </div>
      <div>
        <div className="font-sans text-base font-medium" style={{ color: 'var(--color-text)' }}>
          {label}
        </div>
        <div className="font-sans text-xs" style={{ color: 'var(--color-grey-3)' }}>
          {description}
        </div>
      </div>
    </button>
  )
}

function GameStateSection({ year, password }: { year: string; password: string }) {
  const [current, setCurrent] = useState<GameState | null>(null)
  const [loading, setLoading] = useState<GameState | null>(null)
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    fetch(`/api/${year}/state`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCurrent(d.data?.state ?? null))
      .catch(() => {})
  }, [year])

  async function handleStateChange(state: GameState) {
    if (state === current) return
    setLoading(state)
    setStatus(null)
    try {
      const res = await fetch(`/api/${year}/admin/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ state }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setStatus({ text: data.error ?? t('admin.failed'), ok: false })
      } else {
        setCurrent(state)
        setStatus({ text: t('admin.stateUpdated'), ok: true })
      }
    } catch {
      setStatus({ text: t('admin.networkError'), ok: false })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Section title={t('admin.stateSection')} subtitle={t('admin.stateSubtitle')}>
      <div className="flex flex-col gap-2">
        {STATES.map((s) => (
          <StateCard
            key={s.value}
            label={t(s.labelKey)}
            description={t(s.descKey)}
            selected={current === s.value}
            disabled={loading !== null}
            onClick={() => handleStateChange(s.value)}
          />
        ))}
      </div>
      <StatusMsg msg={status} />
    </Section>
  )
}

// ── Section 3: Enter Winners ──────────────────────────────────────────────────

function WinnerNomineeCard({
  name, filmTitle, selected, onClick,
}: {
  name: string; filmTitle: string | null; selected: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const shadow = selected ? CARD_SHADOW_SELECTED : hovered ? CARD_SHADOW_HOVER : CARD_SHADOW_DEFAULT
  const bg = selected ? 'var(--color-warning-100)' : hovered ? '#FDFDF5' : 'var(--color-surface)'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all"
      style={{ background: bg, boxShadow: shadow }}
    >
      <div className="relative h-5 w-5 shrink-0">
        {selected ? (
          <>
            <div className="absolute inset-[2px] rounded-full bg-gold-600" />
            <div className="absolute left-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-white" />
          </>
        ) : (
          <div
            className="absolute inset-[2px] rounded-full border-2 transition-colors"
            style={{ borderColor: hovered ? '#B99C36' : 'var(--color-grey-2)' }}
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-sans text-base font-normal" style={{ color: 'var(--color-text)' }}>
          {name}
        </span>
        {filmTitle && filmTitle !== name && (
          <span className="font-sans text-sm italic" style={{ color: 'var(--color-grey-3)' }}>
            {filmTitle}
          </span>
        )}
      </div>
    </button>
  )
}

function WinnersSection({ year, password }: { year: string; password: string }) {
  const [categories, setCategories] = useState<CategoryWithNominees[]>([])
  const [winners, setWinners] = useState<Record<string, string[]>>({})
  const [fetched, setFetched] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settingOffseason, setSettingOffseason] = useState(false)
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null)
  const { t } = useTranslation()

  async function loadNominees() {
    setFetching(true)
    try {
      const res = await fetch(`/api/${year}/nominees`, { cache: 'no-store' })
      const data = await res.json()
      const cats: CategoryWithNominees[] = data.data ?? []
      const preselected: Record<string, string[]> = {}
      for (const cat of cats) {
        const catWinners = cat.nominees.filter((n) => n.is_winner).map((n) => n.id)
        if (catWinners.length > 0) preselected[cat.id] = catWinners
      }
      setCategories(cats)
      setWinners(preselected)
      setFetched(true)
    } catch {
      setStatus({ text: t('admin.failedLoadNominees'), ok: false })
    } finally {
      setFetching(false)
    }
  }

  function toggleWinner(catId: string, nomineeId: string) {
    setWinners((prev) => {
      const current = prev[catId] ?? []
      const next = current.includes(nomineeId)
        ? current.filter((id) => id !== nomineeId)
        : [...current, nomineeId]
      return { ...prev, [catId]: next }
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setStatus(null)
    const winnerList = Object.values(winners).flat().filter(Boolean).map((id) => ({ nominee_id: id }))
    try {
      const res = await fetch(`/api/${year}/admin/winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ winners: winnerList }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setStatus({ text: data.error ?? t('admin.failed'), ok: false })
      } else {
        setStatus({ text: t('admin.winnersSaved', { count: data.data.scores_calculated }), ok: true })
        setSaved(true)
      }
    } catch {
      setStatus({ text: t('admin.networkError'), ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section title={t('admin.winnersSection')} subtitle={t('admin.winnersSubtitle')}>
      {!fetched ? (
        <Button onClick={loadNominees} disabled={fetching}>
          {fetching ? t('admin.loading') : t('admin.loadCategories')}
        </Button>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.id}>
              <p className="mb-2 font-serif text-base font-medium" style={{ color: 'var(--color-text)' }}>
                {cat.name}
              </p>
              <div className="space-y-1.5">
                {cat.nominees.map((n) => (
                  <WinnerNomineeCard
                    key={n.id}
                    name={n.name}
                    filmTitle={n.film_title}
                    selected={(winners[cat.id] ?? []).includes(n.id)}
                    onClick={() => toggleWinner(cat.id, n.id)}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? t('admin.saving') : t('admin.saveWinners')}
            </Button>
            {saved && (
              <Button
                variant="outline"
                disabled={settingOffseason}
                onClick={async () => {
                  setSettingOffseason(true)
                  try {
                    const res = await fetch(`/api/${year}/admin/state`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
                      body: JSON.stringify({ state: 'offseason' }),
                    })
                    const data = await res.json()
                    if (!res.ok || data.error) {
                      setStatus({ text: data.error ?? t('admin.failedOffseason'), ok: false })
                    } else {
                      setStatus({ text: t('admin.offseasonSet'), ok: true })
                      setSaved(false)
                    }
                  } catch {
                    setStatus({ text: t('admin.networkError'), ok: false })
                  } finally {
                    setSettingOffseason(false)
                  }
                }}
              >
                {settingOffseason ? t('admin.updating') : t('admin.setOffseasonBtn')}
              </Button>
            )}
          </div>
        </div>
      )}
      <StatusMsg msg={status} />
    </Section>
  )
}
