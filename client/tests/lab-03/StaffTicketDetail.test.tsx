import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { StaffTicketDetailView } from "../../src/components/StaffTicketDetailView.js";

const mockTicket = {
  id: 101,
  ticketNumber: "TXT-2025-00101",
  summary: "VPN Connection Dropping",
  description: "User reports VPN disconnects every 15 minutes when working remotely.",
  category: { id: 2, name: "Network" },
  relatedSystem: { id: 3, name: "VPN Gateway" },
  requestedPriority: "HIGH",
  itPriority: "HIGH",
  status: "IN_PROGRESS",
  resolutionSummary: "",
  requesterId: 1,
  requester: { id: 1, name: "Jennifer Anderson", email: "jennifer@toktickit.com", department: "Computer Engineering" },
  owner: { id: 5, name: "Michael Brown", email: "michael@toktickit.com" },
  createdAt: "2025-05-12T08:00:00Z",
  updatedAt: "2025-05-12T09:30:00Z",
  attachments: [
    {
      id: 1,
      filename: "vpn-logs.txt",
      fileSize: 2048,
      mimeType: "text/plain",
      isRemoved: false,
    },
  ],
};

describe("StaffTicketDetailView Component (Lab 3)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/tickets/101/public-comments")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        } as Response);
      }
      if (urlStr.includes("/api/tickets/101/internal-notes")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        } as Response);
      }
      if (urlStr.includes("/api/admin/users")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        } as Response);
      }
      if (urlStr.includes("/api/tickets/101")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockTicket }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) } as Response);
    });
  });

  it("renders ticket summary, number, requester info, attachments, public comments, and internal notes", async () => {
    render(<StaffTicketDetailView ticketId={101} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("TXT-2025-00101")).toBeInTheDocument();
      expect(screen.getByText("VPN Connection Dropping")).toBeInTheDocument();
      expect(screen.getAllByText("Jennifer Anderson").length).toBeGreaterThan(0);
      expect(screen.getByText("vpn-logs.txt")).toBeInTheDocument();
      expect(screen.getAllByText(/Public Comments/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Internal Notes/i).length).toBeGreaterThan(0);
      expect(screen.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeInTheDocument();
    });
  });

  it("handles soft removal modal prompt for attachments", async () => {
    render(<StaffTicketDetailView ticketId={101} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("vpn-logs.txt")).toBeInTheDocument();
    });

    const removeBtn = screen.getByRole("button", { name: /Remove/i });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Remove Attachment/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Reason for removal/i)).toBeInTheDocument();
    });
  });
});
