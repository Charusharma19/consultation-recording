/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f6f6f9',
          100: '#eef0f3',
          200: '#d7dbe2',
          300: '#b2b9c7',
          400: '#8791a8',
          500: '#64708c',
          600: '#4e5973',
          700: '#3e465b',
          800: '#262933',
          900: '#14161d',
          950: '#0a0b0e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
