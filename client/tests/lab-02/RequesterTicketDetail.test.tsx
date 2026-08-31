import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { TicketDetailView } from "../../src/components/TicketDetailView.js";
import { RequesterProvider } from "../../src/context/RequesterContext.js";

const mockRequesters = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@kmutt.ac.th",
    department: "Computer Engineering",
    isActive: true,
  },
];

const mockTicketDetail = {
  id: 101,
  ticketNumber: "TKT-2026-000101",
  requesterId: 1,
  categoryId: 2,
  category: { id: 2, name: "Hardware", code: "HARDWARE" },
  relatedSystemId: 7,
  relatedSystem: { id: 7, name: "Corporate Laptop", code: "LAPTOP" },
  requester: mockRequesters[0],
  requestedPriority: "HIGH",
  itPriority: "MEDIUM",
  status: "NEW",
  summary: "Laptop battery drains quickly",
  description: "Detailed description of laptop issue.",
  itOwnerName: "John Support",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachments: [],
};

describe("Requester Ticket Detail Experience (UI-08, FR-11)", () => {
  const onBackMock = vi.fn();

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

      if (urlStr.includes("/api/tickets/101")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockTicketDetail }),
        } as Response);
      }

      return Promise.reject(new Error("Unknown route"));
    });
  });

  it("renders read-only ticket fields, status, and priority (UI-08, FR-11)", async () => {
    render(
      <RequesterProvider>
        <TicketDetailView ticketId={101} onBack={onBackMock} />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("TKT-2026-000101")).toBeInTheDocument();
      expect(screen.getByText("Laptop battery drains quickly")).toBeInTheDocument();
      expect(screen.getByText("Detailed description of laptop issue.")).toBeInTheDocument();
    });
  });
});
