/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Healthfirst-inspired palette: deep blue primary, teal accent (not-for-profit health insurer).
        navy: {
          50: '#eaf1fb',
          100: '#d3e2f6',
          200: '#a4c4ed',
          300: '#76a6e4',
          400: '#3d7ed6',
          500: '#0f4c9c',
          600: '#0d4187',
          700: '#0a336a',
          800: '#08284f',
          900: '#061c38',
          950: '#041224',
        },
        orange: {
          50: '#e9fbf7',
          100: '#c9f4ea',
          200: '#94e9d6',
          300: '#5fddc2',
          400: '#2fcfae',
          500: '#0ea894',
          600: '#0b8877',
          700: '#08685c',
          800: '#064b42',
          900: '#04302b',
        },
        slate: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d7dbe3',
          300: '#b7bec9',
          400: '#8b95a5',
          500: '#657286',
          600: '#4d586b',
          700: '#3a4456',
          800: '#262e3d',
          900: '#171d28',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
