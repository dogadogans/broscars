interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-surface-subtle p-4 ${className}`}
    >
      {children}
    </div>
  )
}
