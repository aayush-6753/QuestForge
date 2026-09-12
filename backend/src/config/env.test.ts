import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

describe("loadEnv", () => {
  it("fails fast when required production configuration is missing", () => {
    expect(() => loadEnv({ NODE_ENV: "production" })).toThrow("Invalid server environment");
  });

  it("provides safe defaults in test mode", () => {
    expect(loadEnv({ NODE_ENV: "test" }).PORT).toBe(3001);
  });
});
