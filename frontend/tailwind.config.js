/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        surface: {
          DEFAULT: "#0f0f1a",
          card:    "#16162a",
          border:  "#1e1e35",
          muted:   "#1a1a2e",
        },
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
        "gradient-dark":   "linear-gradient(135deg, #0f0f1a 0%, #16162a 100%)",
        "gradient-glow":   "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)",
        "gradient-card":   "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)",
      },
      boxShadow: {
        "glow-brand":  "0 0 40px rgba(99,102,241,0.3)",
        "glow-violet": "0 0 40px rgba(139,92,246,0.25)",
        "card":        "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover":  "0 8px 48px rgba(99,102,241,0.2)",
      },
      animation: {
        "fade-up":       "fadeUp 0.6s ease forwards",
        "fade-in":       "fadeIn 0.4s ease forwards",
        "pulse-glow":    "pulseGlow 2s ease-in-out infinite",
        "spin-slow":     "spin 3s linear infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "slide-in-right":"slideInRight 0.5s ease forwards",
        "count-up":      "countUp 1s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.5)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
