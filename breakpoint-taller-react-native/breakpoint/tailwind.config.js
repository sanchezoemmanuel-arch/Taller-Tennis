/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.js'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        court: {
          50: '#EDF7F1',
          100: '#D3EBDD',
          500: '#1F7A4D',
          600: '#186040',
          900: '#0B2B1D',
        },
        clay: {
          100: '#F6E2D3',
          500: '#D9782C',
          600: '#B85F1D',
        },
      },
    },
  },
  plugins: [],
};
