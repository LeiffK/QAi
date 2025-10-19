/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7fb',
          100: '#d8ecf5',
          200: '#b9dff0',
          300: '#8ccce4',
          400: '#64bad9',
          500: '#489cd0',
          600: '#3a81af',
          700: '#306892',
          800: '#244f71',
          900: '#17374f',
          950: '#0c2031',
        },
        dark: {
          bg: '#0a0e1a',
          surface: '#131827',
          border: '#1f2937',
          text: '#e5e7eb',
          muted: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Futura', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

