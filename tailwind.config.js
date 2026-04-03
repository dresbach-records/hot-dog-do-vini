/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#EA1D2C",
          "red-dark": "#C8111F",
          orange: "#FF6900",
          yellow: "#FFB800",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Lilita One", "cursive"],
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        blink: "blink 1.6s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
}
