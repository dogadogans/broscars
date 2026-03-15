'use client'

interface IconButtonProps {
  isActive?: boolean
  onClick?: (e: React.MouseEvent) => void
  'aria-label': string
  children: React.ReactNode
}

export default function IconButton({
  isActive = false,
  onClick,
  'aria-label': ariaLabel,
  children,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`icon-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-md${isActive ? ' is-active' : ''}`}
    >
      {children}
    </button>
  )
}
