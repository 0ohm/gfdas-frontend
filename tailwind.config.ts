/* tailwind.config.ts — Design System "Magnetometric HMI" para GFDAS */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#001F2D",
          light: "#0D3347",
          dark: "#001520",
        },
        lime: {
          DEFAULT: "#A8CF45",
          light: "#C4E871",
          dark: "#7FA830",
          50: "#F5FAE8",
        },
        magenta: {
          DEFAULT: "#E6007E",
          light: "#FF4DA6",
          dark: "#B80064",
        },
        slate: {
          DEFAULT: "#475569",
          light: "#64748B",
          dark: "#334155",
        },
        surface: {
          DEFAULT: "#F8F9FA",
          card: "#FFFFFF",
          dim: "#E2E8F0",
        },
        hmi: {
          bg: "#F8F9FF",
          "surface-container": "#E6EEFF",
          "surface-high": "#DCE9FF",
          "on-surface": "#0D1C2E",
          outline: "#72787C",
          "outline-variant": "#C2C7CC",
        },
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-bold": ["14px", { lineHeight: "20px", fontWeight: "700" }],
        "data-mono": ["20px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      spacing: {
        "touch": "48px",
        "gutter": "1.5rem",
        "card-p": "1.25rem",
        "safe-zone": "32px",
      },
      borderRadius: {
        "hmi-sm": "4px",
        "hmi-md": "8px",
        "hmi-lg": "12px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0, 31, 45, 0.08)",
        "card-hover": "0 4px 12px rgba(0, 31, 45, 0.12)",
        "status-bar": "0 2px 8px rgba(0, 31, 45, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
