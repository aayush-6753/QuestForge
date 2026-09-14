import { describe, expect, it, vi } from "vitest";
import { logger } from "./logger.js";

describe("logger", () => {
  it("redacts credentials and serializes errors", () => {
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logger.error("failed", {
      authorization: "Bearer private",
      nested: { password: "private" },
      error: Object.assign(new Error("database failed"), { code: "P1001" }),
    });

    expect(output).toHaveBeenCalledWith("failed", {
      authorization: "[REDACTED]",
      nested: { password: "[REDACTED]" },
      error: { name: "Error", message: "database failed", code: "P1001" },
    });
  });
});
