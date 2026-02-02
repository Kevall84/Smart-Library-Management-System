/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#05070d",
          soft: "#0b1020",
          card: "#0f1629",
        },
        primary: {
          DEFAULT: "#5b6cff",
          50: "#eef0ff",
          100: "#e0e4ff",
          200: "#c7ceff",
          300: "#a4afff",
          400: "#8188ff",
          500: "#5b6cff",
          600: "#4c5aff",
          700: "#3d48e6",
          800: "#333db8",
          900: "#2f3691",
          glow: "#8f9bff",
        },
        accent: {
          gold: "#d4af37",
          soft: "#f5e6b8",
          purple: "#a855f7",
          pink: "#ec4899",
          cyan: "#06b6d4",
        },
        muted: "#9aa4bf",
      },

      boxShadow: {
        glow: "0 0 30px rgba(91,108,255,0.25)",
        "glow-lg": "0 0 50px rgba(91,108,255,0.4)",
        "glow-xl": "0 0 80px rgba(91,108,255,0.5)",
        soft: "0 10px 30px rgba(0,0,0,0.4)",
        "soft-lg": "0 20px 60px rgba(0,0,0,0.5)",
      },

      backdropBlur: {
        xs: "2px",
      },

      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },

      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-fast": "float-fast 3s ease-in-out infinite",
        "fade-up": "fade-up-soft 0.8s ease-out both",
        "fade-in": "fade-in 0.6s ease-out both",
        "slide-right": "slide-in-right 0.6s ease-out both",
        "slide-left": "slide-in-left 0.6s ease-out both",
        "scale-in": "scale-in 0.5s ease-out both",
        "shimmer": "shimmer 2s infinite",
        "gradient": "gradient-shift 3s ease infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #5b6cff 0%, #8f9bff 50%, #a855f7 100%)",
        "gradient-accent": "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%)",
      },
    },
  },
  plugins: [],
};
