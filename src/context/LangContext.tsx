'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Locale } from '@/types'

interface LangContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LangContext = createContext<LangContextValue>({
  locale: 'en',
  setLocale: () => {},
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const stored = localStorage.getItem('broscar_locale') as Locale | null
    if (stored === 'en' || stored === 'tr') {
      setLocaleState(stored)
      return
    }
    // No stored preference — use browser language
    const browserLocale: Locale = navigator.language.startsWith('tr') ? 'tr' : 'en'
    setLocaleState(browserLocale)
  }, [])

  function setLocale(next: Locale) {
    setLocaleState(next)
    localStorage.setItem('broscar_locale', next)
  }

  return (
    <LangContext.Provider value={{ locale, setLocale }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
