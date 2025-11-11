// tailwind.config.js (Tailwind v3.x 표준)

/** @type {import('tailwindcss').Config} */
module.exports = {
    // v3.x는 'content'를 사용합니다.
    content: [
      './src/**/*.{js,jsx,ts,tsx}', 
      './public/index.html',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }