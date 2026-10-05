import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StaffTicketDetailView } from "../../src/components/StaffTicketDetailView.js";
import { TicketDetailView } from "../../src/components/TicketDetailView.js";
import * as api from "../../src/api.js";
import { AuthProvider } from "../../src/context/AuthContext.js";
import { RequesterProvider } from "../../src/context/RequesterContext.js";

const sampleStaffUser = {
  id: 2,
  name: "Michael Staff",
  email: "michael@toktickit.com",
  role: "IT_STAFF",
};

const sampleRequesterUser = {
  id: 1,
  name: "Jennifer Requester",
  email: "jennifer@toktickit.com",
  role: "REQUESTER",
};

const sampleTicket: api.Ticket = {
  id: 101,
  ticketNumber: "TKT-WF-001",
  summary: "Workflow Test Ticket",
  description: "Testing ticket workflow transitions.",
  status: "IN_PROGRESS",
  requestedPriority: "MEDIUM",
  itPriority: "HIGH",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  requesterId: 1,
  requester: sampleRequesterUser,
  ownerId: 2,
  owner: sampleStaffUser,
  itOwnerName: "Michael Staff",
  categoryId: 1,
  category: { id: 1, name: "Hardware", code: "HW" },
  relatedSystemId: 1,
  relatedSystem: { id: 1, name: "Laptop", code: "LAP" },
  attachments: [],
};

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js");
  return {
    ...actual,
    fetchTicketDetail: vi.fn().mockImplementation(() => Promise.resolve(sampleTicket)),
    updateStaffTicket: vi.fn(),
    resolveTicketByRequester: vi.fn().mockImplementation(() => Promise.resolve(sampleTicket)),
    fetchRequesters: vi.fn().mockResolvedValue([{ id: 1, name: "Jennifer Requester", email: "jennifer@toktickit.com" }]),
    fetchAdminUsers: vi.fn().mockResolvedValue({ data: [] }),
    fetchPublicComments: vi.fn().mockResolvedValue({ data: [] }),
    fetchInternalNotes: vi.fn().mockResolvedValue({ data: [] }),
    fetchActionsTaken: vi.fn().mockResolvedValue({ data: [] }),
  };
});

describe("Lab 4 Ticket Workflow & Resolution Gate UI Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [sampleRequesterUser] }),
        } as Response);
      }
      if (urlStr.includes("/api/tickets/101")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: sampleTicket }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      } as Response);
    });
  });

  describe("StaffTicketDetailView - Status Transitions & Resolution Gate", () => {
    it("renders permitted status options for IN_PROGRESS ticket and resolution gate hint", async () => {
      vi.mocked(api.fetchTicketDetail).mockResolvedValue(sampleTicket);

      localStorage.setItem("toktickit_auth_token", "fake-staff-token");
      localStorage.setItem("toktickit_auth_user", JSON.stringify(sampleStaffUser));

      render(
        <AuthProvider>
          <StaffTicketDetailView ticketId={101} onBack={vi.fn()} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Workflow Test Ticket")).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText(/Ticket Status/i) as HTMLSelectElement;
      expect(statusSelect).toBeInTheDocument();

      const options = Array.from(statusSelect.options).map((o) => o.value);
      expect(options).toContain("IN_PROGRESS");
      expect(options).toContain("WAITING_FOR_REQUESTER");
      expect(options).toContain("RESOLVED");
      expect(options).toContain("CANCELLED");

      fireEvent.change(statusSelect, { target: { value: "RESOLVED" } });

      await waitFor(() => {
        expect(screen.getByText(/Resolution Summary/i)).toBeInTheDocument();
        expect(screen.getByText(/Resolution requires a non-empty summary and at least 1 Action Taken record/i)).toBeInTheDocument();
      });
    });

    it("submits status transition with resolution summary and expectedUpdatedAt timestamp", async () => {
      vi.mocked(api.fetchTicketDetail).mockResolvedValue({
        ...sampleTicket,
        status: "IN_PROGRESS",
      });
      vi.mocked(api.updateStaffTicket).mockResolvedValue({
        ...sampleTicket,
        status: "RESOLVED",
        resolutionSummary: "Fixed system memory issue.",
      });

      localStorage.setItem("toktickit_auth_token", "fake-staff-token");
      localStorage.setItem("toktickit_auth_user", JSON.stringify(sampleStaffUser));

      render(
        <AuthProvider>
          <StaffTicketDetailView ticketId={101} onBack={vi.fn()} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Workflow Test Ticket")).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText(/Ticket Status/i);
      fireEvent.change(statusSelect, { target: { value: "RESOLVED" } });

      const summaryTextarea = screen.getByPlaceholderText(/Describe how the problem was resolved/i);
      fireEvent.change(summaryTextarea, { target: { value: "Fixed system memory issue." } });

      const submitBtn = screen.getByRole("button", { name: /Update Workflow/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(api.updateStaffTicket).toHaveBeenCalledWith(101, expect.objectContaining({
          status: "RESOLVED",
          resolutionSummary: "Fixed system memory issue.",
          expectedUpdatedAt: sampleTicket.updatedAt,
        }));
        expect(screen.getByText(/Ticket workflow updated successfully!/i)).toBeInTheDocument();
      });
    });
  });

  describe("TicketDetailView - Requester Advisory Resolution", () => {
    it("renders Problem Appears Resolved button and calls resolveTicketByRequester API", async () => {
      vi.mocked(api.fetchTicketDetail).mockResolvedValue(sampleTicket);
      vi.mocked(api.resolveTicketByRequester).mockResolvedValue(sampleTicket);

      localStorage.setItem("toktickit_auth_token", "fake-requester-token");
      localStorage.setItem("toktickit_auth_user", JSON.stringify(sampleRequesterUser));
      localStorage.setItem("toktickit_dev_requester_id", "1");

      render(
        <AuthProvider>
          <RequesterProvider>
            <TicketDetailView ticketId={101} onBack={vi.fn()} />
          </RequesterProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Workflow Test Ticket")).toBeInTheDocument();
      });

      const resolveBtn = screen.getByRole("button", { name: /Problem Appears Resolved/i });
      expect(resolveBtn).toBeInTheDocument();

      fireEvent.click(resolveBtn);

      await waitFor(() => {
        expect(api.resolveTicketByRequester).toHaveBeenCalledWith(101);
        expect(screen.getByText(/Thank you! Ticket marked as Problem Appears Resolved/i)).toBeInTheDocument();
      });
    });
  });
});
