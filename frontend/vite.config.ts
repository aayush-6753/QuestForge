import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  cacheDir: ".vite-cache",
  server: {
    port: 5173,
  },
  test: {
    environment: "jsdom",
    exclude: ["dist/**", "node_modules/**"],
    globals: true,
  },
});
