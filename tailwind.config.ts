import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#d4af37', // Oscar gold
          600: '#b8960c',
          700: '#926e0a',
          800: '#715408',
          900: '#533d06',
        },
        surface: {
          DEFAULT: '#1a1a2e',
          subtle: '#16213e',
          raised: '#0f3460',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans)', 'sans-serif'],
        serif: ['var(--font-noto-serif)', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
