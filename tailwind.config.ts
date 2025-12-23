/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './frontend/index.html',
    './frontend/src/**/*.{js,ts,jsx,tsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#ffffff',
        accent: '#0066cc',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
