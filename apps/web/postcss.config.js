// postcss.config.js
// Tailwind v4 is handled entirely by the @tailwindcss/vite plugin —
// it must NOT also appear here as a PostCSS plugin or it runs twice.
// Keep autoprefixer if you need vendor prefixes; otherwise this file
// can also be deleted entirely.
module.exports = {
  plugins: {
    autoprefixer: {},
  },
};