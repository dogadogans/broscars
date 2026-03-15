'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useDeviceToken } from '@/hooks/useDeviceToken'
import { useTranslation } from '@/hooks/useTranslation'
import { getAvatarColor } from '@/lib/utils/avatar'

const NAME_KEY = 'broscar_display_name'

export default function JoinPage() {
  const router = useRouter()
  const { token } = useDeviceToken()
  const { t } = useTranslation()

  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current year
  useEffect(() => {
    fetch('/api/years')
      .then((r) => r.json())
      .then((json) => {
        const first = (json.data ?? [])[0]
        if (first?.year) setCurrentYear(first.year)
      })
      .catch(() => {})
  }, [])

  // If already logged in, skip to vote
  useEffect(() => {
    const stored = localStorage.getItem(NAME_KEY)
    if (stored && token && currentYear) {
      router.replace(`/${currentYear}/vote`)
    }
  }, [token, currentYear, router])

  const avatarColor = name.trim() ? getAvatarColor(name.trim()) : '#555'
  const previewName = name.trim() || '?'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || pin.length !== 4 || !currentYear) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: trimmed, pin, year: currentYear, token }),
      })

      const json = await res.json()

      if (res.status === 401) {
        setError('Yanlış PIN. Tekrar dene.')
        return
      }

      if (!res.ok || json.error) {
        setError(t('errors.genericError'))
        return
      }

      localStorage.setItem('broscar_token', json.data.token)
      localStorage.setItem(NAME_KEY, trimmed)
      if (json.data.user?.avatar_color) {
        localStorage.setItem('broscar_avatar_color', json.data.user.avatar_color)
      }
      window.dispatchEvent(new Event('broscar:auth'))

      router.push(`/${currentYear}/vote`)
    } catch {
      setError(t('errors.genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4">
    <div className="mx-auto w-full max-w-[480px] pb-16 pt-6">
      <div
        className="rounded-lg p-6"
        style={{ background: 'var(--color-surface)', boxShadow: '0 0 0 1px rgba(173,173,173,0.50)' }}
      >
        <h1 className="mb-1 font-serif text-[26px] font-medium" style={{ color: 'var(--color-text)' }}>
          {t('join.heading')} {currentYear ?? ''} Broscar
        </h1>
        <p className="mb-8 font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>
          {t('join.nameHint')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-3">
            <Avatar displayName={previewName} color={avatarColor} size="lg" />
            <span className="font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>
              {t('join.avatarPreview')}
            </span>
          </div>

          {/* Name input */}
          <Input
            label={t('join.nameLabel')}
            value={name}
            onChange={(value) => { setName(value); setError(null) }}
            placeholder={t('join.namePlaceholder')}
            maxLength={32}
            autoFocus
            className="w-full"
          />

          {/* PIN input */}
          <div className="space-y-1">
            <Input
              label="PIN"
              value={pin}
              onChange={(value) => { setPin(value.replace(/\D/g, '').slice(0, 4)); setError(null) }}
              placeholder="••••"
              inputMode="numeric"
              className="w-full"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || pin.length !== 4 || loading || !token || !currentYear}
          >
            {loading ? t('common.loading') : t('join.submit')}
          </Button>
        </form>
      </div>
    </div>
    </div>
  )
}
