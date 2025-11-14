/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pfluger brand colors
        'brick': '#9A3324',
        'dark-blue': '#003C71',
        'sky-blue': '#00A9E0',
        'olive-green': '#67823A',
        'chartreuse': '#B5BD00',
        'orange': '#F2A900',
        'salmon': '#f16555ff',
      },
    },
  },
  plugins: [],
}
