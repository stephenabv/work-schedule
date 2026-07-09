import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fablab: {
          DEFAULT: "#ec4899",
          light: "#fce7f3",
          dark: "#831843",
        },
        lab: {
          DEFAULT: "#eab308",
          light: "#fef9c3",
          dark: "#713f12",
        },
        nstp: {
          DEFAULT: "#0ea5e9",
          light: "#e0f2fe",
          dark: "#0c4a6e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
