import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthPage } from "./AuthPage";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../features/auth/auth-context", () => ({
  useAuth: () => ({
    session: null,
    isLoading: false,
    signIn: mocks.signIn,
    signUp: mocks.signUp,
    signOut: mocks.signOut,
  }),
}));

describe("AuthPage", () => {
  it("keeps the user on signup when email confirmation is required", async () => {
    mocks.signUp.mockResolvedValue({ requiresEmailConfirmation: true });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "player@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(mocks.signUp).toHaveBeenCalledWith("player@example.com", "password123");
    });
    expect(screen.getByRole("status")).toHaveTextContent("Check your email to confirm your account");
  });
});
