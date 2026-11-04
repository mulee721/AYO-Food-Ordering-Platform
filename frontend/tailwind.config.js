/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Luxury Landing Palette ──────────────────────────
        ink:   '#171717',   // primary dark / navbar / hero / footer
        gold: {
          DEFAULT: '#C9A45C',
          light:   '#DEC07E',
          dark:    '#A8823D',
          50:      '#FAF5EA',
          100:     '#F3E8CC',
        },
        ivory: {
          DEFAULT: '#F8F1E5',
          dark:    '#EDE3D0',
          deeper:  '#E2D5BE',
        },
        muted: '#777777',   // secondary text
        // ── Dashboard Palette (unchanged) ───────────────────
        navy: {
          900: '#0f1729',
          800: '#162035',
          700: '#1e2d47',
          600: '#253659',
          500: '#2d406b',
        },
        brand: {
          50:  '#fff2ed',
          100: '#ffe3d7',
          200: '#ffcbb0',
          400: '#ff7c45',
          500: '#f25822',
          600: '#d84512',
          700: '#b7340b',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif:   ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        card:   '0 2px 16px 0 rgba(15,23,41,0.08)',
        popup:  '0 8px 32px 0 rgba(15,23,41,0.18)',
        gold:   '0 4px 24px 0 rgba(201,164,92,0.30)',
        luxury: '0 8px 48px 0 rgba(23,23,23,0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        fadeUp:   { '0%': { opacity: '0', transform: 'translateY(28px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer:  { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        floatY:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseGold:{ '0%,100%': { boxShadow: '0 0 0 0 rgba(201,164,92,0.4)' }, '50%': { boxShadow: '0 0 0 12px rgba(201,164,92,0)' } },
      },
      animation: {
        fadeUp:    'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        fadeIn:    'fadeIn 0.5s ease forwards',
        shimmer:   'shimmer 1.8s linear infinite',
        floatY:    'floatY 5s ease-in-out infinite',
        pulseGold: 'pulseGold 2.5s infinite',
      },
    },
  },
  plugins: [],
}
