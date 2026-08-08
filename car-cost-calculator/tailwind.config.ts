import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10151A",
        paper: "#F7F5F0",
        brass: "#C08A3E",
        moss: "#2F5D50",
        rust: "#B5502F",
        slate: {
          850: "#16202B",
          950: "#0B1116",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(16,21,26,0.25)",
        card: "0 2px 12px rgba(16,21,26,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        checkIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
        checkIn: "checkIn 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
