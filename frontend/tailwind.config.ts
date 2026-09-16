import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C1C1C",
        coal: "#0D1B2A",
        parchment: "#D7B899",
        vellum: "#F5E6CA",
        ember: "#F4B400",
        ruby: "#FF6B6B",
        sapphire: "#E6D6FF",
        emerald: "#A7C957",
        amethyst: "#FF2E88",
        citrine: "#E3B505",
        system: "#00C2CB",
        strength: "#800020",
        knowledge: "#1E3A8A",
        discipline: "#4E342E",
        "discipline-active": "#FF8C00",
        creativity: "#4B0082",
        adventure: "#1B4332",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
      },
      boxShadow: {
        glow: "6px 6px 0 #0B132B",
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
