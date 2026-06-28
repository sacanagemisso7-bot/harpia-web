/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F766E',
        'primary-dark': '#0B5A54',
        accent: '#10B981',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        ink: '#1E293B',
        muted: '#64748B',
      },
    },
  },
  plugins: [],
};
