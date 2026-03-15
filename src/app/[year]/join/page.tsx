'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useDeviceToken } from '@/hooks/useDeviceToken'
import { useTranslation } from '@/hooks/useTranslation'
import { getAvatarColor } from '@/lib/utils/avatar'

const NAME_KEY = 'broscar_display_name'

export default function JoinPage() {
  const { year } = useParams()
  const router = useRouter()
  const { token } = useDeviceToken()
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If already joined on this device, skip to wall (account exists)
  useEffect(() => {
    const stored = localStorage.getItem(NAME_KEY)
    if (stored && token) {
      router.replace(`/${year}/wall`)
    }
  }, [token, year, router])

  const avatarColor = name.trim() ? getAvatarColor(name.trim()) : '#555'
  const previewName = name.trim() || '?'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || pin.length !== 4) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: trimmed, pin, year: Number(year), token }),
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
      window.dispatchEvent(new Event('broscar:auth'))

      if (json.data.nameTaken) {
        router.push(`/${year}/wall`)
      } else {
        router.push(`/${year}/vote`)
      }
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
          {t('join.heading')} {year} Broscar
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
            {error && (
              <p className="font-sans text-sm" style={{ color: 'var(--color-danger-500)' }}>
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || pin.length !== 4 || loading || !token}
          >
            {loading ? t('common.loading') : t('join.submit')}
          </Button>
        </form>
      </div>
    </div>
    </div>
  )
}
