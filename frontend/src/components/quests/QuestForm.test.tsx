import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestForm } from "./QuestForm";

describe("QuestForm", () => {
  it("normalizes and submits editable quest fields", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<QuestForm isPending={false} onCancel={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "  Read a chapter  " } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "LEARNING" } });
    fireEvent.change(screen.getByLabelText("Difficulty"), { target: { value: "MEDIUM" } });
    fireEvent.change(screen.getByLabelText("Due date"), { target: { value: "2099-09-15T12:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Save quest" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Read a chapter",
        description: null,
        category: "LEARNING",
        difficulty: "MEDIUM",
        dueAt: new Date("2099-09-15T12:00").toISOString(),
      });
    });
  });

  it("does not submit a new past due date", async () => {
    const onSubmit = vi.fn();

    render(<QuestForm isPending={false} onCancel={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Old quest" } });
    fireEvent.change(screen.getByLabelText("Due date"), { target: { value: "2020-01-01T12:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Save quest" }));

    expect(await screen.findByText("Choose a future due date.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
