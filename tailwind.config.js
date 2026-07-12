/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f17",
        steel: {
          50: "#f6f7fb",
          100: "#eceef5",
          200: "#d4d8e6",
          300: "#a9b0c6",
          400: "#7c8499",
          500: "#5b6478",
          600: "#3f4659",
          700: "#262c3d",
          800: "#161a27",
          900: "#0a0d16",
        },
        amber: {
          400: "#f5b942",
          500: "#e89c1f",
        },
        moss: {
          400: "#8ec07c",
          500: "#5fa14a",
          600: "#3f7c2b",
        },
        rust: {
          400: "#e87f5a",
          500: "#d35d34",
        },
        slate2: {
          400: "#7aa2c8",
          500: "#4f80b0",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
