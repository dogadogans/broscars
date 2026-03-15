'use client'

import { useLang } from '@/context/LangContext'
import en from '../../locales/en.json'
import tr from '../../locales/tr.json'

const locales = { en, tr }

type NestedObject = { [key: string]: string | NestedObject }

function getByPath(obj: NestedObject, path: string): string | undefined {
  return path.split('.').reduce<string | NestedObject | undefined>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as NestedObject)[key]
    return undefined
  }, obj) as string | undefined
}

/**
 * Returns a translation function `t(key, vars?)`.
 * - key uses dot notation: "vote.progress"
 * - vars replaces {{placeholder}} tokens: t("vote.progress", { current: 3, total: 23 })
 * - Falls back to the key itself if the translation is not found.
 */
export function useTranslation() {
  const { locale } = useLang()
  const messages = locales[locale] as unknown as NestedObject

  function t(key: string, vars?: Record<string, string | number>): string {
    let value = getByPath(messages, key) ?? key

    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
      }
    }

    return value
  }

  return { t, locale }
}
