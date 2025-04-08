/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      animation: {
        'textShift': 'textShift 12s infinite linear',
      },
      keyframes: {
        textShift: {
          '0%, 20%': { transform: 'translateX(0%)' },
          '80%, 100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}