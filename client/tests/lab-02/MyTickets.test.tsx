import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "../../src/App.js";

const mockRequesters = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@kmutt.ac.th",
    department: "Computer Engineering",
    isActive: true,
  },
  {
    id: 2,
    name: "David Lee",
    email: "david.l@kmutt.ac.th",
    department: "Information Technology",
    isActive: true,
  },
];

const mockTickets = [
  {
    id: 101,
    ticketNumber: "TKT-2026-000101",
    requesterId: 1,
    categoryId: 2,
    category: { id: 2, name: "Hardware" },
    relatedSystemId: 7,
    relatedSystem: { id: 7, name: "Corporate Laptop" },
    requestedPriority: "HIGH",
    itPriority: "MEDIUM",
    status: "NEW",
    summary: "Laptop battery drains quickly",
    description: "Detailed description of laptop issue.",
    itOwnerName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 102,
    ticketNumber: "TKT-2026-000102",
    requesterId: 1,
    categoryId: 4,
    category: { id: 4, name: "Network" },
    relatedSystemId: 3,
    relatedSystem: { id: 3, name: "VPN" },
    requestedPriority: "LOW",
    itPriority: "LOW",
    status: "IN_PROGRESS",
    summary: "VPN connection dropping repeatedly",
    description: "Detailed description of VPN issue.",
    itOwnerName: "Michael Support",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("My Tickets Experience (Issue #16)", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("toktickit_dev_requester_id", "1");
    vi.restoreAllMocks();

    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);

      if (urlStr.includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockRequesters }),
        } as Response);
      }

      if (urlStr.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }

      if (urlStr.includes("/api/tickets")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockTickets,
              meta: {
                page: 1,
                pageSize: 10,
                totalItems: 2,
                totalPages: 1,
              },
            }),
        } as Response);
      }

      return Promise.reject(new Error("Unknown route"));
    });
  });

  it("renders owned tickets in table view for selected requester (API-04, FR-06)", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText("TKT-2026-000101")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Laptop battery drains quickly")[0]).toBeInTheDocument();
      expect(screen.getAllByText("VPN connection dropping repeatedly")[0]).toBeInTheDocument();
    });
  });

  it("filters ticket list when search text is entered (UI-05, FR-06, AC-10)", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by ticket no. or summary/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by ticket no. or summary/i);
    fireEvent.change(searchInput, { target: { value: "Laptop" } });

    const searchBtn = screen.getByRole("button", { name: "🔍" });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("search=Laptop"),
        expect.anything()
      );
    });
  });

  it("clears active filters when Clear Filters button is clicked (UI-06, FR-08)", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by ticket no. or summary/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by ticket no. or summary/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "VPN" } });

    const clearBtn = screen.getByRole("button", { name: /Clear Filters/i });
    fireEvent.click(clearBtn);

    expect(searchInput.value).toBe("");
  });

  it("clears and reloads tickets when switching requester identity (UI-07, BR-05, AC-11)", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Jennifer Anderson/i })).toBeInTheDocument();
    });

    const userBtn = screen.getByRole("button", { name: /Jennifer Anderson/i });
    fireEvent.click(userBtn);

    const changeBtn = screen.getByRole("button", { name: /Change Requester/i });
    fireEvent.click(changeBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Select Development Requester/i })
      ).toBeInTheDocument();
    });
  });
});
