'use client'

import { useState } from 'react'
import type { Nominee } from '@/types'
import IconButton from '@/components/ui/IconButton'

interface NomineeCardProps {
  nominee: Nominee
  isHeadSelected: boolean
  isHeartSelected: boolean
  onHeadSelect: (nomineeId: string) => void
  onHeartSelect: (nomineeId: string) => void
}

const CARD_SHADOW_DEFAULT  = '0 0 0 1px rgba(173,173,173,0.50)'
const CARD_SHADOW_HOVER    = '0 0 0 1px rgba(185,156,54,0.50)'
const CARD_SHADOW_SELECTED = '0 0 0 2px rgba(185,156,54,1.00)'


function HeartIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 13s-5.5-3.5-5.5-7A3 3 0 0 1 8 4.17 3 3 0 0 1 13.5 6c0 3.5-5.5 7-5.5 7Z"
        fill="var(--color-danger-500)"
        stroke="var(--color-danger-500)"
        strokeWidth="1.33"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 13s-5.5-3.5-5.5-7A3 3 0 0 1 8 4.17 3 3 0 0 1 13.5 6c0 3.5-5.5 7-5.5 7Z"
        stroke="var(--color-grey-4)"
        strokeWidth="1.33"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function NomineeCard({
  nominee,
  isHeadSelected,
  isHeartSelected,
  onHeadSelect,
  onHeartSelect,
}: NomineeCardProps) {
  const [hovered, setHovered] = useState(false)

  const cardBg = isHeadSelected
    ? 'var(--color-warning-100)'
    : hovered
      ? '#FDFDF5'
      : 'var(--color-surface)'

  const cardShadow = isHeadSelected
    ? CARD_SHADOW_SELECTED
    : hovered
      ? CARD_SHADOW_HOVER
      : CARD_SHADOW_DEFAULT

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onHeadSelect(nominee.id)}
      onKeyDown={(e) => e.key === 'Enter' && onHeadSelect(nominee.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all"
      style={{ background: cardBg, boxShadow: cardShadow }}
    >
      {/* Left: radio + text */}
      <div className="flex items-center gap-2.5">
        {/* Radio indicator */}
        <div className="relative h-5 w-5 shrink-0">
          {isHeadSelected ? (
            <>
              <div className="absolute inset-[2px] rounded-full bg-gold-600" />
              <div className="absolute left-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-white" />
            </>
          ) : (
            <div
              className="absolute inset-[2px] rounded-full border-2 transition-colors"
              style={{ borderColor: hovered ? '#B99C36' : 'var(--color-grey-2)' }}
            />
          )}
        </div>

        {/* Name + film */}
        <div className="flex flex-col">
          <span
            className="font-sans text-base font-normal"
            style={{ color: 'var(--color-text)' }}
          >
            {nominee.name}
          </span>
          {nominee.film_title && (
            <span
              className="font-sans text-sm font-normal italic"
              style={{ color: 'var(--color-grey-3)' }}
            >
              {nominee.film_title}
            </span>
          )}
        </div>
      </div>

      {/* Right: heart icon button */}
      <IconButton
        isActive={isHeartSelected}
        onClick={(e) => { e.stopPropagation(); onHeartSelect(nominee.id) }}
        aria-label={isHeartSelected ? 'Kalp seçimini kaldır' : 'Kalp seçimi olarak ayarla'}
      >
        <HeartIcon filled={isHeartSelected} />
      </IconButton>
    </div>
  )
}
