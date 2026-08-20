/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ultimate: {
          dark: '#0B0D17',     // Main deep background
          card: '#161925',     // Card background
          accent: '#E62429',   // Marvel Red accent
          gold: '#F4B942',     // Gold border highlight
          muted: '#8E94A5',    // Secondary text
          purple: '#6B4E9E',   // Event purple
          blue: '#1e3a8a',
          green: '#14532d',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        comic: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card-hover': '0 10px 25px -5px rgba(230, 36, 41, 0.3), 0 8px 10px -6px rgba(230, 36, 41, 0.3)',
        'premium': '0 0 15px 2px rgba(230, 36, 41, 0.15)',
        'gold-glow': '0 0 15px 2px rgba(244, 185, 66, 0.25)',
      }
    },
  },
  plugins: [],
}
