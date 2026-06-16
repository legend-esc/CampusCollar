/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        campus: {
          primary: '#4f46e5',
          secondary: '#7c3aed',
          accent: '#f59e0b',
          success: '#10b981',
          danger: '#ef4444',
          dark: '#1e1b4b',
          light: '#f5f3ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
