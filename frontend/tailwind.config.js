/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm brand palette — Indian-friendly, food-focused
        brand: {
          // Saffron / warm orange — primary CTA color
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // primary
          600: '#ea580c',  // primary hover
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        cream: {
          // Warm off-white backgrounds
          50:  '#fefdfb',
          100: '#fdf8f0',
          200: '#fbf0dc',
          300: '#f5e4c3',
        },
        spice: {
          // Deep brown — secondary, footers, dark text
          50:  '#fdf8f6',
          400: '#a07856',
          500: '#7c5a3e',
          600: '#5c4127',
          700: '#3e2a18',
          800: '#2b1d10',
          900: '#1a110a',
        },
        leaf: {
          // Green accent — fresh, organic, success
          500: '#16a34a',
          600: '#15803d',
        },
      },
      fontFamily: {
        // Elegant serif for headlines, clean sans for body
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(124,90,62,0.85) 0%, rgba(249,115,22,0.7) 100%)',
        'cta-warm': 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)',
      },
      boxShadow: {
        'warm': '0 10px 30px -10px rgba(249,115,22,0.3)',
        'warm-lg': '0 20px 50px -15px rgba(124,65,16,0.4)',
      },
    },
  },
  plugins: [],
}