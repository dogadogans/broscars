'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PickRow from '@/components/features/PickRow'
import Button from '@/components/ui/Button'
import { useDeviceToken } from '@/hooks/useDeviceToken'
import { useTranslation } from '@/hooks/useTranslation'
import type { CategoryGroup, CategoryWithNominees, LocalPick } from '@/types'

const GROUP_ORDER: CategoryGroup[] = [
  'solo_picture',
  'solo_director',
  'acting',
  'features',
  'writing',
  'craft_sound',
  'shorts',
]

interface ResolvedPick {
  pick: LocalPick
  category: CategoryWithNominees
  headName: string | null
  heartName: string | null
  stepIndex: number
}

export default function ReviewPage() {
  const { year } = useParams()
  const router = useRouter()
  const { token } = useDeviceToken()
  const { t, locale } = useTranslation()

  const [resolved, setResolved] = useState<ResolvedPick[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('broscar_picks')
    if (!raw) {
      router.replace(`/${year}/vote`)
      return
    }

    const picks: LocalPick[] = JSON.parse(raw)

    fetch(`/api/${year}/nominees`)
      .then((r) => r.json())
      .then((json) => {
        const categories: CategoryWithNominees[] = json.data ?? []

        // Map each group to a step index (preserving GROUP_ORDER)
        const presentGroups = GROUP_ORDER.filter((g) =>
          categories.some((c) => c.group === g)
        )
        const stepMap: Partial<Record<CategoryGroup, number>> = {}
        presentGroups.forEach((g, i) => { stepMap[g] = i })

        // Sort categories by step order, then order_index
        const sorted = [...categories].sort((a, b) => {
          const ai = GROUP_ORDER.indexOf(a.group as CategoryGroup)
          const bi = GROUP_ORDER.indexOf(b.group as CategoryGroup)
          if (ai !== bi) return ai - bi
          return a.order_index - b.order_index
        })

        const out: ResolvedPick[] = sorted.map((cat) => {
          const pick = picks.find((p) => p.category_id === cat.id) ?? {
            category_id: cat.id,
            head_nominee_id: null,
            heart_nominee_id: null,
            note: '',
          }
          const headNominee = pick.head_nominee_id
            ? cat.nominees.find((n) => n.id === pick.head_nominee_id) ?? null
            : null
          const heartNominee = pick.heart_nominee_id
            ? cat.nominees.find((n) => n.id === pick.heart_nominee_id) ?? null
            : null

          return {
            pick,
            category: cat,
            headName: headNominee?.name ?? null,
            heartName: heartNominee?.name ?? null,
            stepIndex: stepMap[cat.group as CategoryGroup] ?? 0,
          }
        })

        setResolved(out)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year, router])

  const unanswered = resolved.filter((r) => !r.pick.head_nominee_id).length

  async function handleSubmit() {
    if (!token) return
    setSubmitting(true)
    setError(null)

    try {
      const picks = resolved.map((r) => r.pick)
      const res = await fetch(`/api/${year}/picks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-token': token,
        },
        body: JSON.stringify({ picks }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? t('errors.genericError'))
        return
      }

      localStorage.removeItem('broscar_picks')
      router.push(`/${year}/wall`)
    } catch {
      setError(t('errors.genericError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4">
        <div className="mx-auto w-full max-w-[480px] py-16" style={{ color: 'var(--color-grey-3)' }}>
          {t('common.loading')}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4">
    <div className="mx-auto w-full max-w-[480px] pb-24 pt-6">
      <h1 className="mb-1 font-serif text-[26px] font-medium" style={{ color: 'var(--color-text)' }}>
        {t('review.heading')}
      </h1>
      <p className="mb-6 font-sans text-sm" style={{ color: 'var(--color-grey-3)' }}>
        Son bir kez seçtiklerini gözden geçir, locked in yaptıktan sonra değiştiremiyorsun canım.
      </p>

      {unanswered > 0 && (
        <div
          className="mb-6 rounded-lg px-4 py-3 font-sans text-sm"
          style={{ background: 'var(--color-warning-100)', color: 'var(--color-text)' }}
        >
          {t('review.unansweredWarning', { count: unanswered })}
        </div>
      )}

      <div className="mb-8 space-y-2">
        {resolved.map((r) => (
          <PickRow
            key={r.category.id}
            categoryName={locale === 'tr' ? r.category.name_tr : r.category.name}
            headPickName={r.headName}
            heartPickName={r.heartName}
            onEdit={() => router.push(`/${year}/vote?step=${r.stepIndex}`)}
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 font-sans text-sm" style={{ color: 'var(--color-danger-500)' }}>{error}</p>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          {t('common.back')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !token}
        >
          {submitting ? t('common.loading') : t('review.submit')}
        </Button>
      </div>
    </div>
    </div>
  )
}
