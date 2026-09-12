import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

describe("loadEnv", () => {
  it("fails fast when required production configuration is missing", () => {
    expect(() => loadEnv({ NODE_ENV: "production" })).toThrow("Invalid server environment");
  });

  it("provides safe defaults in test mode", () => {
    expect(loadEnv({ NODE_ENV: "test" }).PORT).toBe(3001);
  });

  it("allows both common Vite dev origins in test mode", () => {
    expect(loadEnv({ NODE_ENV: "test" }).CLIENT_ORIGINS).toEqual([
      "http://localhost:5173",
      "http://localhost:5174",
    ]);
  });

  it("accepts comma-separated client origins", () => {
    expect(
      loadEnv({
        NODE_ENV: "test",
        CLIENT_ORIGINS: "http://localhost:5173, http://localhost:4173",
      }).CLIENT_ORIGINS,
    ).toEqual(["http://localhost:5173", "http://localhost:4173"]);
  });

  it("rejects invalid client origins", () => {
    expect(() => loadEnv({ NODE_ENV: "test", CLIENT_ORIGINS: "not-a-url" })).toThrow("CLIENT_ORIGINS");
  });
});
