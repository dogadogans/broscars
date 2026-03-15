'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { getAvatarColor } from '@/lib/utils/avatar'
import { useDeviceToken } from '@/hooks/useDeviceToken'
import type { Year } from '@/types'

const ICON_RING = '0 0 0 1px rgba(152,150,150,0.50), 0 1px 2px rgba(44,41,41,0.08)'

const NAME_KEY = 'broscar_display_name'
const TOKEN_KEY = 'broscar_token'

export default function HomePage() {
  const { token } = useDeviceToken()

  const [currentYear, setCurrentYear] = useState<Year | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [totalCategories, setTotalCategories] = useState(0)
  const [userPickCount, setUserPickCount] = useState(0)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [joining, setJoining] = useState(false)

  // Join form
  const [joinName, setJoinName] = useState('')
  const [joinPin, setJoinPin] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Accessible label ids
  const nameId = useId()
  const pinId = useId()

  // Autofocus name input only on desktop (avoid keyboard-triggered layout shift on mobile)
  const nameInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (joining && window.matchMedia?.('(pointer: fine)').matches) {
      nameInputRef.current?.focus()
    }
  }, [joining])

  useEffect(() => {
    setDisplayName(localStorage.getItem(NAME_KEY))
  }, [])

  useEffect(() => {
    fetch('/api/years')
      .then((r) => r.json())
      .then((json) => setCurrentYear((json.data ?? [])[0] ?? null))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!currentYear || !token) return

    Promise.all([
      fetch(`/api/${currentYear.year}/nominees`).then((r) => r.json()),
      fetch(`/api/${currentYear.year}/participants`).then((r) => r.json()),
      fetch(`/api/${currentYear.year}/my-picks`, {
        headers: { 'x-device-token': token },
      }).then((r) => r.json()),
    ])
      .then(([nomineesJson, participantsJson, myPicksJson]) => {
        const categories: unknown[] = nomineesJson.data ?? []
        setTotalCategories(categories.length)
        setParticipantCount(participantsJson.data?.count ?? 0)
        setUserPickCount(myPicksJson.data?.submitted_count ?? 0)
        setDataLoaded(true)
      })
      .catch(() => setDataLoaded(true))
  }, [currentYear, token])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = joinName.trim()

    if (!trimmed) {
      setJoinError('Görünen ad gerekli.')
      return
    }
    if (!joinPin) {
      setJoinError('PIN gerekli.')
      return
    }
    if (!token) return

    setJoinLoading(true)
    setJoinError(null)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: trimmed,
          pin: joinPin,
          year: currentYear?.year,
          token,
        }),
      })
      const json = await res.json()

      if (res.status === 401) {
        setJoinError('Yanlış PIN. Tekrar dene.')
        return
      }

      if (!res.ok || json.error) {
        setJoinError('Bir şeyler ters gitti. Lütfen tekrar dene.')
        return
      }

      localStorage.setItem(TOKEN_KEY, json.data.token)
      localStorage.setItem(NAME_KEY, trimmed)
      window.dispatchEvent(new Event('broscar:auth'))
      window.location.href = `/${currentYear?.year}/vote`
    } catch {
      setJoinError('Bir şeyler ters gitti. Lütfen tekrar dene.')
    } finally {
      setJoinLoading(false)
    }
  }

  const votingOpen = currentYear?.state === 'voting'
  const year = currentYear?.year

  // Derive in-progress pick count from localStorage
  let sessionPickCount = 0
  try {
    const raw = localStorage.getItem('broscar_picks')
    if (raw) {
      const picks = JSON.parse(raw) as { head_nominee_id: string | null }[]
      sessionPickCount = picks.filter((p) => p.head_nominee_id).length
    }
  } catch {}

  const displayedPickCount =
    userPickCount > 0 ? userPickCount : sessionPickCount
  const isDone =
    dataLoaded && totalCategories > 0 && userPickCount >= totalCategories
  const avatarColor = displayName ? getAvatarColor(displayName) : '#aaa'
  const joinAvatarColor = joinName.trim()
    ? getAvatarColor(joinName.trim())
    : '#aaa'

  // Compute view state inline
  let viewState:
    | 'loading'
    | 'not-joined'
    | 'joining'
    | 'in-progress'
    | 'done'
    | 'ended' = 'loading'

  if (currentYear) {
    if (!votingOpen) {
      viewState = 'ended'
    } else if (joining) {
      viewState = 'joining'
    } else if (!displayName) {
      viewState = 'not-joined'
    } else if (isDone) {
      viewState = 'done'
    } else {
      viewState = 'in-progress'
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center gap-10 px-4 py-12"
      style={{ background: 'var(--color-white)' }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center gap-3">
        <Image src="/oscar-big.png" alt="Oscar heykeli" width={71} height={80} />
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="font-serif text-2xl font-bold tracking-wide"
            style={{ color: 'var(--color-text)' }}
          >
            BROSCARS
          </div>
          <div
            className="font-sans text-base"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Oscar 2026 köyüne hoş geldiniz!
          </div>
        </div>
      </div>

      {/* Year card */}
      {currentYear && (
        <div
          className="w-full max-w-[480px] overflow-hidden rounded-lg"
          style={{
            background: 'var(--color-surface)',
            outline: '1px solid var(--color-border)',
          }}
        >
          {/* Card top */}
          <div className="flex flex-col items-center gap-3 px-5 pb-5 pt-5">
            <div className="flex flex-col items-center gap-2">
              <div
                className="font-serif text-2xl font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Oscars {year}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: votingOpen
                      ? 'var(--color-success-400)'
                      : 'var(--color-danger-500)',
                  }}
                />
                <span
                  className="font-sans text-base font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  {votingOpen ? 'Oylar açık' : 'Oylar kapalı'}
                </span>
              </div>
            </div>
            <div
              className="font-sans text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {participantCount} kişi katıldı
            </div>
          </div>

          {/* Card bottom — state-dependent */}
          <div
            className="px-5 py-5"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            {/* Not logged in → Join in */}
            {viewState === 'not-joined' && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setJoining(true)}
                  className="flex items-center gap-3"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-grey-4)]"
                    style={{ background: 'var(--color-bg)', boxShadow: ICON_RING }}
                  >
                    <User size={16} aria-hidden />
                  </div>
                  <span
                    className="font-sans text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Hesaba giriş yap
                  </span>
                </button>
                <Button variant="outline" onClick={() => setJoining(true)}>
                  Katıl
                </Button>
              </div>
            )}

            {/* Joining → inline form */}
            {viewState === 'joining' && (
              <form
                onSubmit={handleJoin}
                className="flex flex-col items-center gap-6"
              >
                <Avatar
                  displayName={joinName.trim() || '?'}
                  color={joinAvatarColor}
                  size="lg"
                />
                <div className="w-full space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor={nameId}
                      className="block font-sans text-sm font-semibold leading-4"
                      style={{ color: 'var(--color-grey-3)' }}
                    >
                      Görünen Ad
                    </label>
                    <input
                      ref={nameInputRef}
                      id={nameId}
                      type="text"
                      name="display_name"
                      autoComplete="nickname"
                      spellCheck={false}
                      placeholder="ör. Batu…"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      maxLength={32}
                      className="input-field w-full rounded-lg px-3 py-2.5 font-sans text-base outline-none"
                      style={{
                        color: 'var(--color-text)',
                        background: 'var(--color-surface)',
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor={pinId}
                      className="block font-sans text-sm font-semibold leading-4"
                      style={{ color: 'var(--color-grey-3)' }}
                    >
                      PIN
                    </label>
                    <input
                      id={pinId}
                      type="number"
                      name="pin"
                      inputMode="numeric"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="1234"
                      min={0}
                      max={9999}
                      value={joinPin}
                      onChange={(e) =>
                        setJoinPin(
                          e.target.value.replace(/\D/g, '').slice(0, 4),
                        )
                      }
                      className="input-field w-full rounded-lg px-3 py-2.5 font-sans text-base tracking-[0.4em] outline-none"
                      style={{
                        color: 'var(--color-text)',
                        background: 'var(--color-surface)',
                      }}
                    />
                  </div>
                </div>

                {/* Always-present error region so screen readers hear updates */}
                <p
                  role="alert"
                  aria-live="assertive"
                  className="w-full min-h-[1.25rem] font-sans text-sm"
                  style={{ color: 'var(--color-danger-500)' }}
                >
                  {joinError ?? ''}
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={joinLoading}
                >
                  {joinLoading ? 'Yükleniyor…' : 'Cevaplamaya başla'}
                </Button>
              </form>
            )}

            {/* Logged in + in progress → Continue */}
            {viewState === 'in-progress' && displayName && (
              <div className="flex items-start justify-between">
                <div className="flex items-end gap-3">
                  <Avatar
                    displayName={displayName}
                    color={avatarColor}
                    size="sm"
                  />
                  <div>
                    <div
                      className="font-sans text-base font-medium"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {displayName}
                    </div>
                    <div
                      className="font-sans text-xs"
                      style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {displayedPickCount}/{totalCategories} cevaplandı
                    </div>
                  </div>
                </div>
                <Button variant="primary" href={`/${year}/vote`}>
                  Devam et
                </Button>
              </div>
            )}

            {/* Logged in + done → See Picks */}
            {viewState === 'done' && displayName && (
              <div className="flex items-start justify-between">
                <div className="flex items-end gap-3">
                  <Avatar
                    displayName={displayName}
                    color={avatarColor}
                    size="sm"
                  />
                  <div>
                    <div
                      className="font-sans text-base font-medium"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {displayName}
                    </div>
                    <div
                      className="font-sans text-xs"
                      style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {totalCategories}/{totalCategories} cevaplandı
                    </div>
                  </div>
                </div>
                <Button variant="outline" href={`/${year}/review`}>
                  Seçimlerimi Gör
                </Button>
              </div>
            )}

            {/* Voting ended → See Results */}
            {viewState === 'ended' && (
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="font-sans text-base font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Sıralama
                  </div>
                  <div
                    className="font-sans text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Oscars {year} sona erdi
                  </div>
                </div>
                <Button variant="outline" href={`/${year}/results`}>
                  Sonuçları Gör
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
