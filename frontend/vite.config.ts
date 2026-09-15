import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  cacheDir: ".vite-cache",
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 520,
  },
  test: {
    environment: "jsdom",
    exclude: ["dist/**", "node_modules/**", "e2e/**"],
    globals: true,
  },
});
