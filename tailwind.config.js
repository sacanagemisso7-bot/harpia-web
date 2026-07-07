/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        'primary-dark': '#0F3D21',
        accent: '#2D6A4F',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        ink: '#1E293B',
        muted: '#64748B',
      },
    },
  },
  plugins: [],
};
