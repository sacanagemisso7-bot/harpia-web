/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A3A5C',
        secondary: '#2E6DA4',
        accent: '#C8A951',
        surface: '#F5F7FA',
        ink: '#2C3E50',
      },
    },
  },
  plugins: [],
};
