/// =====================================================
// REACT FRONTEND SETUP - Complete Foundation
// =====================================================

// =====================================================
// 1. PACKAGE.JSON DEPENDENCIES
// =====================================================
/*
cd frontend
npm install axios react-router-dom @tailwindcss/forms lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
*/

// =====================================================
// 2. TAILWIND CONFIG (tailwind.config.js)
// =====================================================
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          900: '#111827',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}


