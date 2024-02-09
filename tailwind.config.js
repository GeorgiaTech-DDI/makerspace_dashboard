/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite-react/lib/**/*.js",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend:{
      colors:{
        'gt-gold': '#B3A369',
        'gt-diploma': '#F9F6E5',
        'gt-buzz': '#EAAA00',
        'gt-gray': '#54585A',
        'gt-pi': '#D6DBD4'
      }
    }
  },
  plugins: [
    require('flowbite/plugin')({
      charts: true,
  }),
  ],
};
