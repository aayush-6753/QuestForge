import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "./auth.js";

vi.mock("../lib/supabase.js", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const getUserMock = vi.mocked(supabase.auth.getUser);

function createRequest(authorization?: string) {
  return {
    header: vi.fn((name: string) => (name.toLowerCase() === "authorization" ? authorization : undefined)),
  } as unknown as Request;
}

describe("requireAuth", () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it("stores the verified Supabase user on the request", async () => {
    const req = createRequest("Bearer valid-token");
    const next = vi.fn();

    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3",
          email: "hero@example.com",
        },
      },
      error: null,
    });

    await requireAuth(req, {} as Response, next);

    expect(getUserMock).toHaveBeenCalledWith("valid-token");
    expect(req.auth).toEqual({
      userId: "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3",
      email: "hero@example.com",
    });
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects invalid tokens", async () => {
    const req = createRequest("Bearer bad-token");
    const next = vi.fn();

    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error("invalid"),
    });

    await requireAuth(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: "UNAUTHORIZED" }));
  });
});
