import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#EEF2F8",
          100: "#D6DFEE",
          200: "#AEBFDD",
          300: "#7E98C4",
          400: "#4F70A8",
          500: "#2F5088",
          600: "#21437A",
          700: "#17325E",
          800: "#10264A",
          900: "#0B1B33",
          950: "#071326",
        },
        gold: {
          100: "#F6ECD0",
          300: "#E8CF8A",
          400: "#DDB964",
          500: "#C9A24B",
          600: "#A8832F",
          700: "#856521",
        },
        surface: "#F3F5F9",
        ink: "#0E1A2E",
        muted: "#55627A",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Figtree Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 27, 51, 0.06), 0 12px 32px -12px rgba(11, 27, 51, 0.18)",
        search: "0 2px 4px rgba(7, 19, 38, 0.08), 0 28px 60px -24px rgba(7, 19, 38, 0.45)",
      },
      maxWidth: {
        page: "76rem",
      },
    },
  },
  plugins: [],
};

export default config;
