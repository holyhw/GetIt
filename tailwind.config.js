/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1E3A5F",
        brand: "#FF7A00",
        muted: "#F5F7FA",
      },
    },
  },
  plugins: [],
}

