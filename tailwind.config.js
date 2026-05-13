/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0E1421",
        foreground: "#F5F1E8",
        card: {
          DEFAULT: "#1A2233",
          foreground: "#F5F1E8",
          active: "#223041",
        },
        primary: {
          DEFAULT: "#C8A96B",
          foreground: "#0E1421",
          light: "#E3C88A",
        },
        secondary: {
          DEFAULT: "#1A2233",
          foreground: "#F5F1E8",
        },
        muted: {
          DEFAULT: "#1A2233",
          foreground: "#6E7783",
        },
        accent: {
          DEFAULT: "#1A2233",
          foreground: "#F5F1E8",
        },
        destructive: {
          DEFAULT: "hsl(0 70% 45%)",
          foreground: "hsl(0 0% 98%)",
        },
        border: "#2B3746",
        input: "#2B3746",
        ring: "#C8A96B",
        gold: {
          DEFAULT: "#C8A96B",
          light: "#E3C88A",
        },
        subtext: "#A9B3BF",
      },
      fontFamily: {
        serif: ["Cinzel", "Noto Serif KR", "serif"],
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
