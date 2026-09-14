import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../../lib/supabase.js";
import { createApp } from "../../app.js";
import { updateUserProfile } from "./me.service.js";

vi.mock("../../lib/supabase.js", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock("./me.service.js", () => ({
  getOrCreateUserFoundation: vi.fn(),
  updateUserProfile: vi.fn(),
}));

const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
const authorization = { Authorization: "Bearer valid-token" };
const getUserMock = vi.mocked(supabase.auth.getUser);
const updateUserProfileMock = vi.mocked(updateUserProfile);

describe("PATCH /api/v1/me", () => {
  const app = createApp();

  beforeEach(() => {
    getUserMock.mockReset();
    updateUserProfileMock.mockReset();
    getUserMock.mockResolvedValue({
      data: { user: { id: userId, email: "hero@example.com" } },
      error: null,
    });
    updateUserProfileMock.mockResolvedValue({
      profile: { userId, displayName: "Aayush", timezone: "Asia/Kolkata" },
      character: { userId, level: 1 },
      attributes: [],
    });
  });

  it("updates only validated profile fields", async () => {
    const response = await request(app)
      .patch("/api/v1/me")
      .set(authorization)
      .send({ displayName: "  Aayush  ", timezone: "Asia/Kolkata" });

    expect(response.status).toBe(200);
    expect(updateUserProfileMock).toHaveBeenCalledWith(expect.anything(), userId, {
      displayName: "Aayush",
      timezone: "Asia/Kolkata",
    });
    expect(response.body.data.profile).toMatchObject({ displayName: "Aayush", timezone: "Asia/Kolkata" });
  });

  it("accepts null to clear the display name", async () => {
    const response = await request(app).patch("/api/v1/me").set(authorization).send({ displayName: null });

    expect(response.status).toBe(200);
    expect(updateUserProfileMock).toHaveBeenCalledWith(expect.anything(), userId, { displayName: null });
  });

  it.each([
    [{}, "empty input"],
    [{ displayName: "   " }, "blank display name"],
    [{ timezone: "Not/A_Timezone" }, "invalid timezone"],
    [{ userId }, "unknown field"],
  ])("rejects %s (%s)", async (body) => {
    const response = await request(app).patch("/api/v1/me").set(authorization).send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(updateUserProfileMock).not.toHaveBeenCalled();
  });
});
