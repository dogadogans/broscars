'use client'

import Link from 'next/link'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  href?: string
  className?: string
}

const OUTLINE_SHADOW =
  '0 0 0 1px rgba(178,178,178,0.50), 0 1px 2px rgba(44,41,41,0.08), 0 1px 1px rgba(0,0,0,0.08)'

export default function Button({
  variant = 'primary',
  href,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary'

  const cls = `inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-sans text-base font-medium disabled:cursor-not-allowed disabled:opacity-50 ${isPrimary ? 'btn-primary' : 'btn-outline'} ${className}`

  const style = isPrimary ? undefined : { boxShadow: OUTLINE_SHADOW }

  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    )
  }

  return (
    <button disabled={disabled} className={cls} style={style} {...props}>
      {children}
    </button>
  )
}
