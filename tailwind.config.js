module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    keyframes: {
      'appear-from-right': {
        'from': { transform: 'translateX(100%)', opacity: 0 },
        'to': { transform: 'translateX(0)', opacity: 1 },
      }
    },
    animation: {
      'appear-from-right': 'appear-from-right ease 0.33s forwards',
    }
  },
  plugins: [],
}