import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequesterDashboardView } from "../../src/components/RequesterDashboardView.js";
import * as api from "../../src/api.js";
import { AuthProvider } from "../../src/context/AuthContext.js";
import { RequesterProvider } from "../../src/context/RequesterContext.js";

const mockRequesterUser = {
  id: 1,
  name: "Jennifer Requester",
  email: "jennifer@toktickit.com",
  role: "REQUESTER",
};

const mockDashboardData: api.RequesterDashboardResponse = {
  metrics: {
    totalTickets: 10,
    openTickets: 4,
    inProgress: 2,
    waitingForRequester: 1,
    resolved: 4,
    closed: 2,
  },
  recentTickets: [
    {
      id: 101,
      ticketNumber: "TKT-REQ-001",
      summary: "Printer in Engineering offline",
      description: "Printer offline description",
      status: "OPEN",
      requestedPriority: "HIGH",
      itPriority: "HIGH",
      categoryId: 1,
      relatedSystemId: 1,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      requesterId: 1,
    },
  ],
  recentlyResolvedTickets: [
    {
      id: 99,
      ticketNumber: "TKT-REQ-099",
      summary: "Monitor screen flickering fixed",
      description: "Monitor screen flickering fixed description",
      status: "RESOLVED",
      requestedPriority: "MEDIUM",
      itPriority: "MEDIUM",
      categoryId: 1,
      relatedSystemId: 1,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      requesterId: 1,
    },
  ],
  requiringAttention: [
    {
      id: 102,
      ticketNumber: "TKT-REQ-002",
      summary: "Software license extension requested",
      description: "Software license extension requested description",
      status: "WAITING_FOR_REQUESTER",
      requestedPriority: "MEDIUM",
      itPriority: "MEDIUM",
      categoryId: 1,
      relatedSystemId: 1,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      requesterId: 1,
    },
  ],
};

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js");
  return {
    ...actual,
    fetchRequesterDashboard: vi.fn(),
    fetchRequesters: vi.fn().mockResolvedValue([{ id: 1, name: "Jennifer Requester", email: "jennifer@toktickit.com" }]),
    getAuthToken: vi.fn().mockReturnValue("fake-token"),
    fetchMeApi: vi.fn().mockImplementation(() => {
      const stored = localStorage.getItem("toktickit_auth_user");
      return Promise.resolve(stored ? JSON.parse(stored) : mockRequesterUser);
    }),
  };
});

describe("Lab 4 Requester Dashboard Component (RequesterDashboardView)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [mockRequesterUser] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      } as Response);
    });

    vi.mocked(api.getAuthToken).mockReturnValue("fake-token");
    vi.mocked(api.fetchRequesterDashboard).mockResolvedValue(mockDashboardData);
    vi.mocked(api.fetchMeApi).mockImplementation(() => {
      const stored = localStorage.getItem("toktickit_auth_user");
      return Promise.resolve(stored ? JSON.parse(stored) : mockRequesterUser);
    });
  });

  it("renders Requester dashboard metrics, action required callout, and sublists", async () => {
    localStorage.setItem("toktickit_auth_token", "fake-requester-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockRequesterUser));
    localStorage.setItem("toktickit_dev_requester_id", "1");

    render(
      <AuthProvider>
        <RequesterProvider>
          <RequesterDashboardView
            onCreateTicketClick={vi.fn()}
            onSelectTicket={vi.fn()}
            onNavigateMyTickets={vi.fn()}
          />
        </RequesterProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Jennifer Requester!/i)).toBeInTheDocument();
    });

    // Metric Cards
    expect(screen.getByText("Total Tickets")).toBeInTheDocument();
    expect(screen.getByText("Needs Response")).toBeInTheDocument();

    // Action Required Banner
    expect(screen.getByText(/Action Required: IT Staff are waiting for your response/i)).toBeInTheDocument();
    expect(screen.getByText("Software license extension requested")).toBeInTheDocument();

    // Recent Requests
    expect(screen.getByText("TKT-REQ-001")).toBeInTheDocument();
    expect(screen.getByText("Printer in Engineering offline")).toBeInTheDocument();

    // Recently Resolved
    expect(screen.getByText("TKT-REQ-099")).toBeInTheDocument();
  });

  it("triggers drill-down navigation when metric card is clicked", async () => {
    localStorage.setItem("toktickit_auth_token", "fake-requester-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockRequesterUser));
    localStorage.setItem("toktickit_dev_requester_id", "1");

    const onNavigateMyTicketsMock = vi.fn();

    render(
      <AuthProvider>
        <RequesterProvider>
          <RequesterDashboardView
            onCreateTicketClick={vi.fn()}
            onSelectTicket={vi.fn()}
            onNavigateMyTickets={onNavigateMyTicketsMock}
          />
        </RequesterProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Jennifer Requester!/i)).toBeInTheDocument();
    });

    const openCard = screen.getByText("Open Tickets").closest("div[role='button']")!;
    fireEvent.click(openCard);

    expect(onNavigateMyTicketsMock).toHaveBeenCalledWith("OPEN");
  });

  it("handles failure state and retry loading action", async () => {
    vi.mocked(api.fetchRequesterDashboard).mockRejectedValueOnce(new Error("Network connection error"));

    localStorage.setItem("toktickit_auth_token", "fake-requester-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockRequesterUser));
    localStorage.setItem("toktickit_dev_requester_id", "1");

    render(
      <AuthProvider>
        <RequesterProvider>
          <RequesterDashboardView
            onCreateTicketClick={vi.fn()}
            onSelectTicket={vi.fn()}
            onNavigateMyTickets={vi.fn()}
          />
        </RequesterProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Unable to Load Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Network connection error/i)).toBeInTheDocument();
    });

    // Retry
    const retryBtn = screen.getByRole("button", { name: /Retry Loading/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Jennifer Requester!/i)).toBeInTheDocument();
    });
  });
});
