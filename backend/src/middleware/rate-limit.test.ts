import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { sendRateLimitError } from "./rate-limit.js";

describe("rate limit response", () => {
  it("uses the shared API error envelope", () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    sendRateLimitError({ requestId: "request-1" } as Request, { status } as unknown as Response);

    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again shortly.",
        requestId: "request-1",
      },
    });
  });
});
