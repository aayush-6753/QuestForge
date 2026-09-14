import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest } from "./api-client";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("./supabase", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
    },
  },
}));

describe("apiRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "access-token" } },
    });
  });

  it("attaches the access token and sends JSON writes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { updated: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiRequest<{ updated: boolean }>("/api/v1/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "Aayush" }),
      }),
    ).resolves.toEqual({ updated: true });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(url).toBe("http://localhost:3001/api/v1/me");
    expect(init.method).toBe("PATCH");
    expect(headers.get("Authorization")).toBe("Bearer access-token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("maps structured API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "VALIDATION_ERROR", message: "Invalid profile.", requestId: "request-1" },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const request = apiRequest("/api/v1/me", { method: "PATCH", body: "{}" });

    await expect(request).rejects.toMatchObject<Partial<ApiClientError>>({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid profile.",
      requestId: "request-1",
    });
  });
});
