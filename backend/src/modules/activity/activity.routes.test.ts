import { ActivityEventType } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { supabase } from "../../lib/supabase.js";
import { listActivity } from "./activity.service.js";

vi.mock("../../lib/supabase.js", () => ({ supabase: { auth: { getUser: vi.fn() } } }));
vi.mock("./activity.service.js", () => ({ listActivity: vi.fn() }));

const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
const authorization = { Authorization: "Bearer valid-token" };

describe("activity routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { id: userId } }, error: null });
    vi.mocked(listActivity).mockResolvedValue({
      items: [{ id: "event", type: ActivityEventType.QUEST_CREATED, metadata: null, createdAt: new Date() }],
      nextCursor: null,
    });
  });

  it("lists the authenticated user's activity with validated pagination", async () => {
    const response = await request(app).get("/api/v1/activity?limit=10").set(authorization);

    expect(response.status).toBe(200);
    expect(listActivity).toHaveBeenCalledWith(expect.anything(), userId, { limit: 10 });
  });

  it("rejects pagination outside the public bounds", async () => {
    const response = await request(app).get("/api/v1/activity?limit=51").set(authorization);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(listActivity).not.toHaveBeenCalled();
  });
});
