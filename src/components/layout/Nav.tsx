'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { getAvatarColor } from '@/lib/utils/avatar'
import { useGameState } from '@/hooks/useGameState'
import { useTranslation } from '@/hooks/useTranslation'
import { useLang } from '@/context/LangContext'
import { Check, Languages, Swords, User } from 'lucide-react'
import type { Locale } from '@/types'

const NAME_KEY = 'broscar_display_name'
const COLOR_KEY = 'broscar_avatar_color'

const RING = '0 0 0 1px rgba(170,170,170,0.50), 0 1px 2px rgba(41,41,41,0.08)'

function Subtitle({ year }: { year: number }) {
  const { t } = useTranslation()
  const { state } = useGameState(year)
  if (state === 'voting') return <span>{t('states.voting')} — {year}</span>
  if (state === 'results') return <span>{t('states.results')} — {year}</span>
  return <span>Oscars {year}</span>
}

export default function Nav() {
  const pathname = usePathname()
  const { locale, setLocale } = useLang()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [avatarColor, setAvatarColor] = useState<string | null>(null)
  const [fallbackYear, setFallbackYear] = useState<number | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sync = () => {
      setDisplayName(localStorage.getItem(NAME_KEY))
      setAvatarColor(localStorage.getItem(COLOR_KEY))
    }
    sync()
    window.addEventListener('broscar:auth', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('broscar:auth', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!langOpen) return
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [langOpen])

  const yearMatch = pathname.match(/^\/(\d{4})(?:\/|$)/)
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null

  useEffect(() => {
    if (year) return
    fetch('/api/years')
      .then((r) => r.json())
      .then((json) => {
        const first = (json.data ?? [])[0]
        if (first?.year) setFallbackYear(first.year)
      })
      .catch(() => {})
  }, [year])

  if (pathname.endsWith('/admin')) return null

  const activeYear = year ?? fallbackYear
  const leaderboardHref = activeYear ? `/${activeYear}/wall` : '/'

  return (
    <header
      className="sticky top-0 z-50 flex justify-center px-4 py-3"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <nav
        className="flex w-full max-w-[480px] items-center justify-between rounded-lg bg-[var(--color-surface)] p-3"
        style={{ boxShadow: RING }}
      >
        {/* Left: Oscar image + wordmark */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image
            src="/oscar.png"
            alt="Oscar heykeli"
            width={28}
            height={32}
            className="shrink-0"
          />
          <div className="min-w-0">
            <div className="text-sm font-bold font-serif tracking-wide text-[var(--color-grey-4)]">
              BROSCARS
            </div>
            <div className="text-sm font-normal font-sans text-[var(--color-grey-3)] truncate">
              {year ? <Subtitle year={year} /> : 'Oscars 2026'}
            </div>
          </div>
        </Link>

        {/* Right: Lang picker + Leaderboard icon + Avatar */}
        <div className="flex shrink-0 items-center gap-2 pl-3">

          {/* Language dropdown */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              aria-label="Select language"
              className="icon-link flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-grey-4)]"
            >
              <Languages size={16} aria-hidden />
            </button>

            {langOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-32 overflow-hidden rounded-lg py-1"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: '0 0 0 1px rgba(170,170,170,0.50), 0 4px 12px rgba(41,41,41,0.12)',
                  zIndex: 100,
                }}
              >
                {(['en', 'tr'] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLocale(lang); setLangOpen(false) }}
                    className="flex w-full items-center justify-between px-3 py-2 font-sans text-sm transition-colors hover:bg-[var(--color-bg)]"
                    style={{
                      color: locale === lang ? 'var(--color-text)' : 'var(--color-grey-3)',
                      fontWeight: locale === lang ? 600 : 400,
                    }}
                  >
                    {lang === 'en' ? 'English' : 'Türkçe'}
                    {locale === lang && <Check size={13} aria-hidden />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href={leaderboardHref}
            aria-label="Sıralama"
            className="icon-link flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-grey-4)]"
          >
            <Swords size={16} aria-hidden />
          </Link>

          {displayName ? (
            <Link href={activeYear ? `/${activeYear}/account` : '/'} aria-label="Hesabım">
              <Avatar displayName={displayName} color={avatarColor ?? getAvatarColor(displayName)} size="sm" />
            </Link>
          ) : (
            <Link
              href="/join"
              aria-label="Katıl"
              className="icon-link flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-grey-4)]"
            >
              <User size={16} aria-hidden />
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
