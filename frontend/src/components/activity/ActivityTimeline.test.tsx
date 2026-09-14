import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActivityTimeline } from "./ActivityTimeline";

const mocks = vi.hoisted(() => ({ useActivity: vi.fn(), fetchNextPage: vi.fn(), refetch: vi.fn() }));
vi.mock("../../hooks/useActivity", () => ({ useActivity: mocks.useActivity }));

describe("ActivityTimeline", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.useActivity.mockReturnValue({
      data: {
        pages: [{
          items: [{
            id: "event-1",
            type: "QUEST_COMPLETED",
            metadata: { questTitle: "Read a chapter", awardedXp: 25 },
            createdAt: "2026-09-14T12:00:00.000Z",
          }],
        }],
      },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: mocks.fetchNextPage,
      refetch: mocks.refetch,
    });
  });

  afterEach(cleanup);

  it("renders server events and loads older pages", () => {
    render(<ActivityTimeline />);

    expect(screen.getByText("Quest completed")).toBeInTheDocument();
    expect(screen.getByText("Read a chapter earned 25 XP")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Load older entries" }));
    expect(mocks.fetchNextPage).toHaveBeenCalled();
  });

  it("renders unknown historical event types defensively", () => {
    mocks.useActivity.mockReturnValue({
      ...mocks.useActivity(),
      data: { pages: [{ items: [{ id: "old", type: "OLD_EVENT", metadata: {}, createdAt: "2026-09-14" }] }] },
      hasNextPage: false,
    });

    render(<ActivityTimeline />);
    expect(screen.getByText("Chronicle updated")).toBeInTheDocument();
  });
});
