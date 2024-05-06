import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        SpaceGrotesk: "'Space Grotesk', system-ui",
        Inter: "'Inter', sans-serif"
      }
    },
  },
  plugins: [],
} satisfies Config

