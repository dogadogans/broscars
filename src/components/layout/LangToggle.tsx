'use client'

import { useLang } from '@/context/LangContext'

export default function LangToggle() {
  const { locale, setLocale } = useLang()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/20 p-1 text-sm">
      <button
        onClick={() => setLocale('en')}
        className={`rounded px-2 py-1 font-medium transition-colors ${
          locale === 'en'
            ? 'bg-gold-500 text-black'
            : 'text-white/60 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('tr')}
        className={`rounded px-2 py-1 font-medium transition-colors ${
          locale === 'tr'
            ? 'bg-gold-500 text-black'
            : 'text-white/60 hover:text-white'
        }`}
      >
        TR
      </button>
    </div>
  )
}
