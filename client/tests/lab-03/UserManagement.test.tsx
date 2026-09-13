import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { UserManagementView } from "../../src/components/UserManagementView.js";

const mockUsers = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer@toktickit.com",
    role: "REQUESTER",
    isActive: true,
    mustChangePassword: false,
    department: "Computer Engineering",
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael@toktickit.com",
    role: "IT_STAFF",
    isActive: true,
    mustChangePassword: false,
    department: "IT Infrastructure",
  },
];

describe("UserManagementView Component (Lab 3)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/admin/users")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockUsers,
              meta: { page: 1, pageSize: 10, totalItems: 2, totalPages: 1 },
            }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown route"));
    });
  });

  it("renders Administrator User Management title, user list, and create user button", async () => {
    render(<UserManagementView />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Administrator User Management/i })
      ).toBeInTheDocument();
      expect(screen.getAllByText("Jennifer Anderson").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Michael Brown").length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: /➕ Create New User/i })).toBeInTheDocument();
    });
  });

  it("opens create user modal when create button is clicked", async () => {
    render(<UserManagementView />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /➕ Create New User/i })).toBeInTheDocument();
    });

    const createBtn = screen.getByRole("button", { name: /➕ Create New User/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /➕ Create New User/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/john@toktickit.com/i)).toBeInTheDocument();
    });
  });
});
