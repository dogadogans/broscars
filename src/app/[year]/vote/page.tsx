'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import NomineeCard from '@/components/features/NomineeCard'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import { useDeviceToken } from '@/hooks/useDeviceToken'
import { useTranslation } from '@/hooks/useTranslation'
import type { CategoryGroup, CategoryWithNominees, LocalPick } from '@/types'

// Step order matches the PRD
const GROUP_ORDER: CategoryGroup[] = [
  'solo_picture',
  'solo_director',
  'acting',
  'features',
  'writing',
  'craft_sound',
  'shorts',
]


// Groups categories into ordered steps
function buildSteps(categories: CategoryWithNominees[]): CategoryWithNominees[][] {
  const byGroup: Partial<Record<CategoryGroup, CategoryWithNominees[]>> = {}
  for (const cat of categories) {
    const g = cat.group as CategoryGroup
    if (!byGroup[g]) byGroup[g] = []
    byGroup[g]!.push(cat)
  }
  return GROUP_ORDER.filter((g) => byGroup[g]?.length).map((g) => byGroup[g]!)
}

// ── Craft & Sound ─────────────────────────────────────────────────────────────

function CraftGrid({
  categories,
  picks,
  onHead,
  onHeart,
}: {
  categories: CategoryWithNominees[]
  picks: Record<string, LocalPick>
  onHead: (catId: string, nomineeId: string) => void
  onHeart: (catId: string, nomineeId: string) => void
}) {
  const { locale } = useTranslation()
  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat.id}>
          <p className="mb-2 font-serif text-[26px] font-medium" style={{ color: 'var(--color-text)' }}>
            {locale === 'tr' ? cat.name_tr : cat.name}
          </p>
          <div className="space-y-2">
            {cat.nominees.map((n) => (
              <NomineeCard
                key={n.id}
                nominee={n}
                isHeadSelected={picks[cat.id]?.head_nominee_id === n.id}
                isHeartSelected={picks[cat.id]?.heart_nominee_id === n.id}
                onHeadSelect={(id) => onHead(cat.id, id)}
                onHeartSelect={(id) => onHeart(cat.id, id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Full nominee cards for all other steps ───────────────────────────────────

function FullCards({
  categories,
  picks,
  onHead,
  onHeart,
}: {
  categories: CategoryWithNominees[]
  picks: Record<string, LocalPick>
  onHead: (catId: string, nomineeId: string) => void
  onHeart: (catId: string, nomineeId: string) => void
}) {
  const { locale } = useTranslation()
  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <div key={cat.id}>
          <p className="mb-3 font-serif text-[26px] font-medium" style={{ color: 'var(--color-text)' }}>
            {locale === 'tr' ? cat.name_tr : cat.name}
          </p>
          <div className="space-y-2">
            {cat.nominees.map((n) => (
              <NomineeCard
                key={n.id}
                nominee={n}
                isHeadSelected={picks[cat.id]?.head_nominee_id === n.id}
                isHeartSelected={picks[cat.id]?.heart_nominee_id === n.id}
                onHeadSelect={(id) => onHead(cat.id, id)}
                onHeartSelect={(id) => onHeart(cat.id, id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function VotePage() {
  const { year } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useDeviceToken()
  const { t } = useTranslation()

  const [steps, setSteps] = useState<CategoryWithNominees[][]>([])
  const initialStep = parseInt(searchParams.get('step') ?? '0', 10)
  const [stepIndex, setStepIndex] = useState(initialStep)
  const [picks, setPicks] = useState<Record<string, LocalPick>>({})
  const [loading, setLoading] = useState(true)

  // Redirect to join if not authenticated
  useEffect(() => {
    if (token === null) return // still hydrating
    const name = localStorage.getItem('broscar_display_name')
    if (!name) router.replace(`/${year}/join`)
  }, [token, year, router])

  // Restore picks from localStorage if returning from review
  useEffect(() => {
    const raw = localStorage.getItem('broscar_picks')
    if (!raw) return
    const saved: LocalPick[] = JSON.parse(raw)
    const map: Record<string, LocalPick> = {}
    for (const p of saved) map[p.category_id] = p
    setPicks(map)
  }, [])

  // Fetch nominees
  useEffect(() => {
    fetch(`/api/${year}/nominees`)
      .then((r) => r.json())
      .then((json) => {
        const built = buildSteps(json.data ?? [])
        setSteps(built)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year])

  const currentStep = steps[stepIndex]
  const currentGroup = currentStep?.[0]?.group as CategoryGroup | undefined
  const isCraftStep = currentGroup === 'craft_sound'
  const totalAnswered = Object.values(picks).filter((p) => p.head_nominee_id).length
  const totalCategories = steps.flat().length

  const handleHead = useCallback((catId: string, nomineeId: string) => {
    setPicks((prev) => {
      const existing = prev[catId] ?? { category_id: catId, head_nominee_id: null, heart_nominee_id: null, note: '' }
      const alreadySelected = existing.head_nominee_id === nomineeId
      return {
        ...prev,
        [catId]: { ...existing, head_nominee_id: alreadySelected ? null : nomineeId },
      }
    })
  }, [])

  const handleHeart = useCallback((catId: string, nomineeId: string) => {
    setPicks((prev) => {
      const existing = prev[catId] ?? { category_id: catId, head_nominee_id: null, heart_nominee_id: null, note: '' }
      const alreadySelected = existing.heart_nominee_id === nomineeId
      return {
        ...prev,
        [catId]: { ...existing, heart_nominee_id: alreadySelected ? null : nomineeId },
      }
    })
  }, [])

  function handleNext() {
    if (stepIndex < steps.length - 1) {
      const next = stepIndex + 1
      setStepIndex(next)
      router.replace(`?step=${next}`, { scroll: false })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Go to review — serialize picks to localStorage
      const allPicks = Object.values(picks).map((p) => ({ ...p }))
      localStorage.setItem('broscar_picks', JSON.stringify(allPicks))
      router.push(`/${year}/review`)
    }
  }

  function handlePrev() {
    if (stepIndex > 0) {
      const prev = stepIndex - 1
      setStepIndex(prev)
      router.replace(`?step=${prev}`, { scroll: false })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="px-4">
        <div className="mx-auto w-full max-w-[480px] py-16 text-white/40">
          {t('common.loading')}
        </div>
      </div>
    )
  }

  if (!steps.length) {
    return (
      <div className="px-4">
        <div className="mx-auto w-full max-w-[480px] py-16 text-white/40">
          Henüz aday yüklenmedi.
        </div>
      </div>
    )
  }

  const isLastStep = stepIndex === steps.length - 1

  return (
    <div className="px-4">
    <div className="mx-auto w-full max-w-[480px] pt-6" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-white/40">
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{t('vote.progress', { current: stepIndex + 1, total: steps.length })}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{totalAnswered}/{totalCategories} cevaplandı</span>
        </div>
        <ProgressBar current={stepIndex + 1} total={steps.length} />

      </div>


      {/* Nominees */}
      {isCraftStep ? (
        <CraftGrid categories={currentStep} picks={picks} onHead={handleHead} onHeart={handleHeart} />
      ) : (
        <FullCards
          categories={currentStep}
          picks={picks}
          onHead={handleHead}
          onHeart={handleHeart}
        />
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={stepIndex === 0}
        >
          {t('vote.prev')}
        </Button>

        <Button onClick={handleNext}>
          {isLastStep ? t('vote.reviewAll') : t('vote.next')}
        </Button>
      </div>
    </div>
    </div>
  )
}
