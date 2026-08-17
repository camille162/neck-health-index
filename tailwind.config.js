/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E',
          light: '#F0FDFA',
          dark: '#085041'
        },
        accent: {
          DEFAULT: '#EA580C',
          light: '#FFEDD5'
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2'
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7'
        }
      }
    }
  },
  plugins: []
}
