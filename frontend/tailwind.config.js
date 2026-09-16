/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dbe4fe',
          300: '#bfd0fd',
          400: '#9cb4fa',
          500: '#6366f1',
          600: '#4f46e5', // Royal Indigo primary
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        slate: {
          850: '#151f32',
          950: '#0b0f19',
        }
      }
    },
  },
  plugins: [],
}

