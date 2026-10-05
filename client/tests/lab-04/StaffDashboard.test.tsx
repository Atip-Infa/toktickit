import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StaffDashboardView } from "../../src/components/StaffDashboardView.js";
import * as api from "../../src/api.js";
import { AuthProvider } from "../../src/context/AuthContext.js";

const mockStaffUser = {
  id: 2,
  name: "Michael Staff",
  email: "michael@toktickit.com",
  role: "IT_STAFF",
};

const mockAdminUser = {
  id: 3,
  name: "Admin User",
  email: "admin@toktickit.com",
  role: "ADMINISTRATOR",
};

const mockDashboardData: api.StaffDashboardResponse = {
  metrics: {
    newTickets: 5,
    openTickets: 12,
    inProgress: 8,
    waitingForRequester: 3,
    myAssigned: 6,
    byStatus: {
      NEW: 5,
      OPEN: 12,
      IN_PROGRESS: 8,
      WAITING_FOR_REQUESTER: 3,
      RESOLVED: 10,
      CLOSED: 15,
      REOPENED: 1,
      CANCELLED: 0,
    },
    byPriority: {
      LOW: 4,
      MEDIUM: 10,
      HIGH: 8,
      URGENT: 3,
    },
  },
  recentTickets: [
    {
      id: 101,
      ticketNumber: "TKT-DASH-001",
      summary: "Laptop battery draining fast",
      status: "IN_PROGRESS",
      requestedPriority: "MEDIUM",
      itPriority: "HIGH",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      requesterId: 1,
      ownerId: 2,
      owner: mockStaffUser,
    },
  ],
  quickStats: {
    unassignedTickets: 4,
  },
};

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js");
  return {
    ...actual,
    fetchStaffDashboard: vi.fn(),
    getAuthToken: vi.fn().mockReturnValue("fake-token"),
    fetchMeApi: vi.fn().mockImplementation(() => {
      const stored = localStorage.getItem("toktickit_auth_user");
      return Promise.resolve(stored ? JSON.parse(stored) : mockStaffUser);
    }),
  };
});

describe("Lab 4 IT Staff Dashboard Component (StaffDashboardView)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.getAuthToken).mockReturnValue("fake-token");
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue(mockDashboardData);
    vi.mocked(api.fetchMeApi).mockImplementation(() => {
      const stored = localStorage.getItem("toktickit_auth_user");
      return Promise.resolve(stored ? JSON.parse(stored) : mockStaffUser);
    });
  });

  it("renders IT Staff operational metric cards, priority breakdown, and recent tickets", async () => {
    localStorage.setItem("toktickit_auth_token", "fake-staff-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockStaffUser));

    render(
      <AuthProvider>
        <StaffDashboardView onSelectTicket={vi.fn()} onNavigateQueue={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Michael Staff!/i)).toBeInTheDocument();
    });

    // Check Metric Cards Labels
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("My Assigned")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Triage")).toBeInTheDocument();

    // Check Priority Breakdown
    expect(screen.getByRole("button", { name: /URGENT/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /HIGH/i })).toBeInTheDocument();

    // Check Recent Ticket
    expect(screen.getByText("TKT-DASH-001")).toBeInTheDocument();
    expect(screen.getByText("Laptop battery draining fast")).toBeInTheDocument();
  });

  it("triggers drill-down navigation when metric card is clicked", async () => {
    const onNavigateQueueMock = vi.fn();

    localStorage.setItem("toktickit_auth_token", "fake-staff-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockStaffUser));

    render(
      <AuthProvider>
        <StaffDashboardView onSelectTicket={vi.fn()} onNavigateQueue={onNavigateQueueMock} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Michael Staff!/i)).toBeInTheDocument();
    });

    // Click Unassigned card
    const unassignedCard = screen.getByText("Unassigned").closest("div[role='button']")!;
    fireEvent.click(unassignedCard);

    expect(onNavigateQueueMock).toHaveBeenCalledWith({ ownerFilter: "unassigned" });
  });

  it("renders Administrator user statistics widget when user role is ADMINISTRATOR", async () => {
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue({
      ...mockDashboardData,
      quickStats: {
        unassignedTickets: 4,
        totalUsers: 15,
        activeUsers: 14,
      },
    });

    localStorage.setItem("toktickit_auth_token", "fake-admin-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockAdminUser));

    render(
      <AuthProvider>
        <StaffDashboardView onSelectTicket={vi.fn()} onNavigateQueue={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Admin User!/i)).toBeInTheDocument();
      expect(screen.getByText(/System User Accounts/i)).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument(); // Total Users
      expect(screen.getByText("14")).toBeInTheDocument(); // Active Users
    });
  });

  it("handles failure state and retry loading action", async () => {
    vi.mocked(api.fetchStaffDashboard).mockRejectedValueOnce(new Error("Database connection lost"));

    localStorage.setItem("toktickit_auth_token", "fake-staff-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockStaffUser));

    render(
      <AuthProvider>
        <StaffDashboardView onSelectTicket={vi.fn()} onNavigateQueue={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Unable to Load Operational Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Database connection lost/i)).toBeInTheDocument();
    });

    // Retry
    const retryBtn = screen.getByRole("button", { name: /Retry Loading/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Michael Staff!/i)).toBeInTheDocument();
    });
  });
});
