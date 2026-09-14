import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { XPProgressBar } from "./XPProgressBar";

describe("XPProgressBar", () => {
  it("renders the progression summary supplied by the API", () => {
    render(
      <XPProgressBar
        label="Strength XP"
        progression={{
          level: 2,
          currentLevelStartXp: 100,
          nextLevelThreshold: 300,
          xpWithinLevel: 80,
          xpRequiredForNextLevel: 200,
          percentage: 40,
        }}
      />,
    );

    const progressbar = screen.getByRole("progressbar", { name: "Strength XP" });

    expect(screen.getByText("80/200")).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "80");
    expect(progressbar).toHaveAttribute("aria-valuemax", "200");
    expect(progressbar.firstElementChild).toHaveStyle({ width: "40%" });
  });
});
