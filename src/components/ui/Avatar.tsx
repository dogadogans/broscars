import { getInitial } from '@/lib/utils/avatar'

interface AvatarProps {
  displayName: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-xl',
}

export default function Avatar({ displayName, color, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
      aria-label={displayName}
    >
      {getInitial(displayName)}
    </div>
  )
}
