interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div
      className="flex w-full items-center gap-0.5 overflow-hidden rounded-lg"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-2 flex-1"
          style={{
            background: i < current ? '#B99C36' : 'var(--color-grey-1)',
          }}
        />
      ))}
    </div>
  )
}
