'use client'

import { useEffect, useRef } from 'react'

const SHADOW =
  '0px 0px 0px 1px rgba(219,219,219,0.50), 0px 1px 2px 0px rgba(44,41,41,0.08), 0px 4px 8px 0px rgba(0,0,0,0.08), 0px 8px 16px 0px rgba(0,0,0,0.04)'

export interface DropdownItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
}

interface DropdownProps {
  items: DropdownItem[]
  isOpen: boolean
  onClose: () => void
  align?: 'left' | 'right'
  returnFocusRef?: React.RefObject<HTMLElement>
}

export default function Dropdown({ items, isOpen, onClose, align = 'right', returnFocusRef }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside pointer
  useEffect(() => {
    if (!isOpen) return
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen, onClose])

  // Close on Escape and return focus to trigger
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        returnFocusRef?.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, returnFocusRef])

  // Focus first menu item when opened
  useEffect(() => {
    if (!isOpen) return
    const first = ref.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')
    first?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute z-50 w-44 overflow-hidden rounded-lg py-2"
      style={{
        background: 'var(--color-surface)',
        boxShadow: SHADOW,
        top: 'calc(100% + 6px)',
        ...(align === 'right' ? { right: 0 } : { left: 0 }),
      }}
    >
      <div className="flex flex-col px-2">
        {items.map((item, i) => {
          const isDanger = item.variant === 'danger'
          return (
            <button
              key={i}
              role="menuitem"
              onClick={() => { item.onClick(); onClose() }}
              className="flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-[var(--color-bg)] active:bg-[var(--color-bg)] focus-visible:outline-2 focus-visible:outline focus-visible:outline-[var(--color-grey-4)] focus-visible:outline-offset-[-2px]"
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center"
                style={{ color: isDanger ? 'var(--color-danger-500)' : 'var(--color-grey-4)' }}
                aria-hidden
              >
                {item.icon}
              </span>
              <span
                className="font-sans text-sm font-medium leading-6"
                style={{ color: isDanger ? 'var(--color-danger-500)' : 'var(--color-grey-4)' }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
