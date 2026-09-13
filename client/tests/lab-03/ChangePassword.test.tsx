import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { ChangePasswordView } from "../../src/components/ChangePasswordView.js";
import { AuthProvider } from "../../src/context/AuthContext.js";

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    fetchMeApi: vi.fn(async () => ({
      id: 2,
      name: "David Lee",
      email: "david@toktickit.com",
      role: "REQUESTER",
      mustChangePassword: true,
      isActive: true,
    })),
    changePasswordApi: vi.fn(async (currentPassword, newPassword) => {
      if (currentPassword === "Password123!") {
        return {
          id: 2,
          name: "David Lee",
          email: "david@toktickit.com",
          role: "REQUESTER",
          mustChangePassword: false,
          isActive: true,
        };
      }
      throw new Error("Current password is incorrect");
    }),
  };
});

describe("ChangePasswordView Component (Lab 3 UI-AUTH-02)", () => {
  it("renders mandatory password change view with requirements checklist", async () => {
    render(
      <AuthProvider>
        <ChangePasswordView />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mandatory Password Change/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Current \(Temporary\) Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Password Requirements/i)).toBeInTheDocument();
  });

  it("disables update button when password confirmation does not match", async () => {
    render(
      <AuthProvider>
        <ChangePasswordView />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mandatory Password Change/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Current \(Temporary\) Password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: "NewPassword123!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "DifferentPassword123!" },
    });

    const submitBtn = screen.getByRole("button", { name: /Update Password/i });
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });
});
