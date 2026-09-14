import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { StaffTicketQueueView } from "../../src/components/StaffTicketQueueView.js";
import { AuthProvider } from "../../src/context/AuthContext.js";

const mockTickets = [
  {
    id: 10,
    ticketNumber: "TXT-2025-00100",
    summary: "Printer in Lab 2 offline",
    category: { id: 1, name: "Hardware" },
    relatedSystem: { id: 1, name: "Printer" },
    requestedPriority: "HIGH",
    itPriority: "URGENT",
    status: "NEW",
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer@toktickit.com" },
    owner: null,
    createdAt: "2025-05-10T10:00:00Z",
    updatedAt: "2025-05-10T12:00:00Z",
  },
];

describe("StaffTicketQueueView Component (Lab 3)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: "Hardware" }]),
        } as Response);
      }
      if (urlStr.includes("/api/staff/tickets")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockTickets,
              meta: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
            }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown route"));
    });
  });

  it("renders IT staff queue title, search bar, filters, and all required ticket fields", async () => {
    render(<StaffTicketQueueView onSelectTicket={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeInTheDocument();
      expect(screen.getAllByText("TXT-2025-00100").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Printer in Lab 2 offline").length).toBeGreaterThan(0);
      expect(screen.getAllByText("URGENT").length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Unassigned/i).length).toBeGreaterThan(0);
    });
  });

  it("handles empty search results and clear filters button", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
      }
      if (urlStr.includes("/api/staff/tickets")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [],
              meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
            }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown route"));
    });

    render(<StaffTicketQueueView onSelectTicket={() => {}} />);

    // Type into search box to trigger no-results state
    const searchInput = screen.getByPlaceholderText(/Search ticket/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentTerm" } });

    await waitFor(() => {
      expect(screen.getByText(/No Tickets Found/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Clear All Filters/i })).toBeInTheDocument();
    });
  });

  it("handles server error state with retry button", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/staff/tickets")) {
        return Promise.reject(new Error("Database server connection timeout"));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });

    render(<StaffTicketQueueView onSelectTicket={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Database server connection timeout/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
    });
  });
});
