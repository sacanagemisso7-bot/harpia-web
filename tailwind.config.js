/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        'primary-dark': '#0F3D21',
        accent: '#2D6A4F',
        surface: '#FAF9F6',
        'surface-warm': '#F7F4EC',
        card: '#FCFBF7',
        border: '#E8E4D8',
        ink: '#1E293B',
        muted: '#64748B',
      },
      boxShadow: {
        card: '0 1px 3px rgba(27, 67, 50, 0.04), 0 1px 2px rgba(27, 67, 50, 0.06)',
      },
    },
  },
  plugins: [],
};
