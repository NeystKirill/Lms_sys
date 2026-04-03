/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          dark: '#4B44CC',
          light: '#9D96FF',
        },
        glass: 'rgba(255,255,255,0.05)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
