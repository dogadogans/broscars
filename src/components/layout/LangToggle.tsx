'use client'

import { useLang } from '@/context/LangContext'

export default function LangToggle() {
  const { locale, setLocale } = useLang()

  return (
    <div
      className="flex items-center gap-1 rounded-lg p-1 text-sm"
      style={{ boxShadow: '0 0 0 1px rgba(173,173,173,0.50)' }}
    >
      <button
        onClick={() => setLocale('en')}
        className="rounded px-2 py-1 font-medium transition-colors"
        style={
          locale === 'en'
            ? { background: 'var(--color-warning-600)', color: '#fff' }
            : { color: 'var(--color-grey-3)' }
        }
      >
        EN
      </button>
      <button
        onClick={() => setLocale('tr')}
        className="rounded px-2 py-1 font-medium transition-colors"
        style={
          locale === 'tr'
            ? { background: 'var(--color-warning-600)', color: '#fff' }
            : { color: 'var(--color-grey-3)' }
        }
      >
        TR
      </button>
    </div>
  )
}
