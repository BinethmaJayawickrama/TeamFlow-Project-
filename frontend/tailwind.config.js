/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        themeRed: {
          DEFAULT: "#ff3b30",
          hover: "#e02d22",
        },
        themeOrange: {
          DEFAULT: "#ff9500",
          yellow: "#ffcc00",
        },
        themeDark: {
          body: "#18191e",
          card: "#1e1f25",
          navbar: "#111216",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
