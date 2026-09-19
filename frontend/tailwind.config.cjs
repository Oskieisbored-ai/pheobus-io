/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Imperial gold
        brand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#d4a017',
          600: '#b8860b',
          700: '#92700c',
          800: '#7a5c10',
          900: '#5c4513',
          950: '#3d2e0a',
        },
        // Warm stone backgrounds
        marble: {
          50: '#fdfcfa',
          100: '#f9f6f0',
          200: '#f3ede2',
          300: '#e8dfd0',
          400: '#d4c5ab',
          500: '#b8a88a',
          600: '#9a8a6e',
          700: '#7d6e55',
          800: '#5e5340',
          900: '#3f382c',
        },
        // Imperial burgundy/wine
        imperial: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9cdd4',
          300: '#f4a3b0',
          400: '#ec6d82',
          500: '#c92a45',
          600: '#a31d38',
          700: '#8b1730',
          800: '#75162d',
          900: '#64162b',
          950: '#380713',
        },
        // Deep Roman navy
        roman: {
          50: '#f4f3f7',
          100: '#e8e6ef',
          200: '#cac6db',
          300: '#a39dbe',
          400: '#7b73a0',
          500: '#5c5483',
          600: '#4a436c',
          700: '#3d3758',
          800: '#2d2841',
          900: '#1e1a2e',
          950: '#12101c',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
