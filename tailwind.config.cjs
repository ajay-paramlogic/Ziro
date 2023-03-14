/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './*.html'],
  darkMode: 'media',
  mode: 'jit',
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  theme: {
    fontFamily: {
      sans: ["'Lato'", 'ui-sans-serif', 'system-ui'],
    },
  },
};
