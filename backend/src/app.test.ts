import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "./lib/prisma.js";
import { createApp } from "./app.js";

vi.mock("./lib/prisma.js", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe("api base", () => {
  const app = createApp();
  const queryRawMock = vi.mocked(prisma.$queryRaw);

  beforeEach(() => {
    queryRawMock.mockReset();
    queryRawMock.mockResolvedValue([{ ok: 1 }]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: "ok", database: "ok" } });
  });

  it("returns service unavailable when PostgreSQL is unreachable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    queryRawMock.mockRejectedValueOnce(new Error("database unavailable"));

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe("SERVICE_UNAVAILABLE");
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it("allows the Vite fallback dev origin", async () => {
    const response = await request(app).get("/api/health").set("Origin", "http://localhost:5174");

    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5174");
  });

  it("rejects protected routes without a bearer token", async () => {
    const response = await request(app).get("/api/v1/me");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it("rejects malformed JSON with a client error", async () => {
    const response = await request(app)
      .post("/api/v1/me")
      .set("Content-Type", "application/json")
      .send('{"invalid"');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_JSON");
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });
});
