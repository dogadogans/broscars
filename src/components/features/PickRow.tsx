'use client'

import { SquarePen } from 'lucide-react'
import IconButton from '@/components/ui/IconButton'

interface PickRowProps {
  categoryName: string
  headPickName: string | null
  heartPickName?: string | null
  onEdit?: () => void
}

const CARD_SHADOW = '0 0 0 1px rgba(173,173,173,0.50)'

function HeartSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 13s-5.5-3.5-5.5-7A3 3 0 0 1 8 4.17 3 3 0 0 1 13.5 6c0 3.5-5.5 7-5.5 7Z"
        fill="var(--color-danger-500)"
        stroke="var(--color-danger-500)"
        strokeWidth="1.33"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PickRow({
  categoryName,
  headPickName,
  heartPickName,
  onEdit,
}: PickRowProps) {
  const showHeart = !!heartPickName && heartPickName !== headPickName

  return (
    <div
      className="flex items-start justify-between gap-2.5 rounded-lg p-3"
      style={{ background: 'var(--color-surface)', boxShadow: CARD_SHADOW }}
    >
      {/* Left: category + pick name + optional heart */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="flex flex-col">
          <span
            className="font-sans text-sm font-normal"
            style={{ color: 'var(--color-grey-3)' }}
          >
            {categoryName}
          </span>
          <span
            className={`font-sans text-base ${headPickName ? 'font-normal' : 'font-bold'}`}
            style={{ color: headPickName ? 'var(--color-text)' : 'var(--color-grey-2)' }}
          >
            {headPickName ?? 'Seçilmedi'}
          </span>
        </div>

        {showHeart && (
          <div className="flex items-start gap-1">
            <span className="mt-[2px] shrink-0"><HeartSmallIcon /></span>
            <span
              className="font-sans text-sm font-normal"
              style={{ color: 'var(--color-danger-500)' }}
            >
              {heartPickName}
            </span>
          </div>
        )}
      </div>

      {/* Right: edit button */}
      {onEdit && (
        <IconButton
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          aria-label="Seçimi düzenle"
        >
          <SquarePen size={16} color="var(--color-text)" />
        </IconButton>
      )}
    </div>
  )
}
