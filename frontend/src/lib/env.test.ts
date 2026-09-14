import { describe, expect, it } from "vitest";
import { loadEnv } from "./env";

describe("client environment", () => {
  it("accepts a complete valid configuration", () => {
    expect(
      loadEnv({
        VITE_SUPABASE_URL: "https://project.supabase.co",
        VITE_SUPABASE_ANON_KEY: "publishable-key",
        VITE_API_BASE_URL: "http://localhost:3001",
      }),
    ).toEqual({
      VITE_SUPABASE_URL: "https://project.supabase.co",
      VITE_SUPABASE_ANON_KEY: "publishable-key",
      VITE_API_BASE_URL: "http://localhost:3001",
    });
  });

  it("rejects missing or invalid values", () => {
    expect(() =>
      loadEnv({
        VITE_SUPABASE_URL: "not-a-url",
        VITE_SUPABASE_ANON_KEY: "",
        VITE_API_BASE_URL: "",
      }),
    ).toThrow("Invalid client environment");
  });
});
