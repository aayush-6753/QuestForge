import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161412",
        coal: "#211f1b",
        parchment: "#efe3c4",
        vellum: "#fbf3dc",
        ember: "#d59d43",
        ruby: "#c8525f",
        sapphire: "#4d78b7",
        emerald: "#4f9a6d",
        amethyst: "#8c6cc4",
        citrine: "#d4b44a",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(0, 0, 0, 0.28)",
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
