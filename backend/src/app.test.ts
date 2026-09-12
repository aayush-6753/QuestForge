import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("api base", () => {
  const app = createApp();

  it("returns health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: "ok" } });
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
});
