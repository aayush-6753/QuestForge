import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileEditor } from "./ProfileEditor";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}));

vi.mock("../../hooks/useMe", () => ({
  useUpdateMe: () => ({
    mutateAsync: mocks.mutateAsync,
    error: null,
    isPending: false,
  }),
}));

describe("ProfileEditor", () => {
  it("updates the display name and timezone through the profile mutation", async () => {
    const onCancel = vi.fn();
    mocks.mutateAsync.mockResolvedValue({});

    render(
      <ProfileEditor
        profile={{
          id: "profile-1",
          userId: "user-1",
          displayName: "Old name",
          avatarKey: null,
          title: null,
          timezone: "UTC",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }}
        onCancel={onCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "New name" } });
    fireEvent.change(screen.getByLabelText("Timezone"), { target: { value: "Asia/Kolkata" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({ displayName: "New name", timezone: "Asia/Kolkata" });
    });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
