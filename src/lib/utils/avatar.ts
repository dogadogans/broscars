const AVATAR_COLORS = [
  '#c0392b', // ruby
  '#8e44ad', // amethyst
  '#2980b9', // sapphire
  '#16a085', // emerald
  '#d35400', // amber
  '#2c3e50', // slate
  '#1abc9c', // turquoise
  '#e74c3c', // coral
  '#9b59b6', // purple
  '#27ae60', // green
]

/** Returns the first character of a display name, uppercased. */
export function getInitial(displayName: string): string {
  return (displayName.trim()[0] ?? '?').toUpperCase()
}

/**
 * Returns a deterministic color from the palette based on a seed string.
 * Same seed always produces the same color.
 */
export function getAvatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0 // force 32-bit int
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}
