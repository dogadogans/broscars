import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function Select({
  value,
  onChange,
  options,
  label,
  placeholder = 'Seç…',
  disabled = false,
  className = '',
}: SelectProps) {
  const id = useId()

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold leading-4"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
        >
          {label}
        </label>
      )}

      <div className="select-wrap relative h-9 min-w-24 rounded-lg" style={{ background: 'var(--color-surface)' }}>
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => { onChange(e.target.value); e.target.blur() }}
          className="absolute inset-0 w-full h-full appearance-none pl-3 pr-8 text-base font-normal cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 rounded-lg"
          style={{ color: 'var(--grey-4)', fontFamily: 'var(--font-sans)', background: 'var(--color-surface)' }}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown size={16} aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>
    </div>
  )
}
