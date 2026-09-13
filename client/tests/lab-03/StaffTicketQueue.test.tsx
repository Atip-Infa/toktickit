import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { StaffTicketQueueView } from "../../src/components/StaffTicketQueueView.js";

const mockTickets = [
  {
    id: 10,
    ticketNumber: "TXT-2025-00100",
    summary: "Printer in Lab 2 offline",
    category: { id: 1, name: "Hardware" },
    relatedSystem: { id: 1, name: "Printer" },
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    status: "NEW",
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer@toktickit.com" },
    owner: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  it("renders IT staff queue title, filter controls, and ticket rows", async () => {
    render(<StaffTicketQueueView onSelectTicket={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeInTheDocument();
      expect(screen.getByText("TXT-2025-00100")).toBeInTheDocument();
      expect(screen.getByText("Printer in Lab 2 offline")).toBeInTheDocument();
    });
  });
});
