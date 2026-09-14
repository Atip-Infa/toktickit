import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { LoginView } from "../../src/components/LoginView.js";
import { AuthProvider } from "../../src/context/AuthContext.js";

// Mock api calls
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    loginApi: vi.fn(async (email, password) => {
      if (email === "jennifer@toktickit.com" && password === "Password123!") {
        return {
          token: "mock-token-123",
          user: {
            id: 1,
            name: "Jennifer Anderson",
            email: "jennifer@toktickit.com",
            role: "REQUESTER",
            mustChangePassword: false,
            isActive: true,
          },
        };
      }
      throw new Error("Invalid email or password");
    }),
    fetchMeApi: vi.fn(async () => {
      throw new Error("No token");
    }),
  };
});

describe("LoginView Component (Lab 3 UI-AUTH-01)", () => {
  it("renders login form with email, password fields and sign in button", () => {
    render(
      <AuthProvider>
        <LoginView />
      </AuthProvider>
    );

    expect(screen.getByText(/Sign in to your account to continue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("shows error alert when submitted with empty fields", async () => {
    render(
      <AuthProvider>
        <LoginView />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter your email address/i)).toBeInTheDocument();
    });
  });

  it("shows error alert when login fails with invalid credentials", async () => {
    render(
      <AuthProvider>
        <LoginView />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "wrong@toktickit.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "WrongPass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });
});
