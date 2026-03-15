import { useId, InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  label?: string
  labelClassName?: string
  className?: string
}

export default function Input({
  value,
  onChange,
  label,
  labelClassName = '',
  className = '',
  disabled,
  ...props
}: InputProps) {
  const id = useId()

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-semibold leading-4 ${labelClassName}`}
          style={{ color: labelClassName ? undefined : 'var(--color-grey-3)', fontFamily: 'var(--font-sans)' }}
        >
          {label}
        </label>
      )}

      <input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="input-field h-9 px-3 rounded-lg text-base font-normal disabled:cursor-not-allowed disabled:opacity-50 w-full"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--grey-4)',
          fontFamily: 'var(--font-sans)',
        }}
        {...props}
      />
    </div>
  )
}
