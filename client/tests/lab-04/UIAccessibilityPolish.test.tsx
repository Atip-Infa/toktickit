import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppHeader } from "../../src/components/AppHeader.js";
import { RequesterDashboardView } from "../../src/components/RequesterDashboardView.js";
import { StaffDashboardView } from "../../src/components/StaffDashboardView.js";
import { ActionsTakenSection } from "../../src/components/ActionsTakenSection.js";
import { AuthProvider } from "../../src/context/AuthContext.js";
import { RequesterProvider } from "../../src/context/RequesterContext.js";
import * as api from "../../src/api.js";

const mockRequesterUser = {
  id: 1,
  name: "Jennifer Requester",
  email: "jennifer@toktickit.com",
  role: "REQUESTER",
};

const mockStaffUser = {
  id: 2,
  name: "Michael Scott",
  email: "michael@toktickit.com",
  role: "IT_STAFF",
};

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js");
  return {
    ...actual,
    fetchRequesterDashboard: vi.fn(),
    fetchStaffDashboard: vi.fn(),
    fetchActionsTaken: vi.fn(),
    createActionTaken: vi.fn(),
    fetchRequesters: vi.fn().mockResolvedValue([{ id: 1, name: "Jennifer Requester", email: "jennifer@toktickit.com" }]),
    getAuthToken: vi.fn().mockReturnValue("fake-token"),
    fetchMeApi: vi.fn().mockImplementation(() => {
      const stored = localStorage.getItem("toktickit_auth_user");
      return Promise.resolve(stored ? JSON.parse(stored) : mockRequesterUser);
    }),
  };
});

describe("Lab 4 UI Accessibility & Polish Verification", () => {
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
  });

  it("AppHeader renders aria-current='page' on active navigation view", async () => {
    localStorage.setItem("toktickit_auth_token", "fake-requester-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockRequesterUser));

    render(
      <AuthProvider>
        <RequesterProvider>
          <AppHeader currentView="requester-dashboard" onNavigate={vi.fn()} />
        </RequesterProvider>
      </AuthProvider>
    );

    const dashboardBtn = await screen.findByRole("button", { name: /dashboard/i });
    expect(dashboardBtn).toHaveAttribute("aria-current", "page");

    const ticketsBtn = screen.getByRole("button", { name: /my tickets/i });
    expect(ticketsBtn).not.toHaveAttribute("aria-current");
  });

  it("RequesterDashboardView metric cards support keyboard Enter/Space triggers", async () => {
    vi.mocked(api.fetchRequesterDashboard).mockResolvedValue({
      metrics: {
        totalTickets: 5,
        openTickets: 2,
        inProgress: 1,
        waitingForRequester: 1,
        resolved: 1,
        closed: 0,
      },
      recentTickets: [],
      recentlyResolvedTickets: [],
      requiringAttention: [],
    });

    localStorage.setItem("toktickit_auth_token", "fake-requester-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockRequesterUser));

    const onNavigateMyTickets = vi.fn();

    render(
      <AuthProvider>
        <RequesterProvider>
          <RequesterDashboardView
            onCreateTicketClick={vi.fn()}
            onSelectTicket={vi.fn()}
            onNavigateMyTickets={onNavigateMyTickets}
          />
        </RequesterProvider>
      </AuthProvider>
    );

    const totalCard = await screen.findByRole("button", { name: /total tickets: 5/i });
    expect(totalCard).toBeInTheDocument();

    // Trigger Enter key
    fireEvent.keyDown(totalCard, { key: "Enter" });
    expect(onNavigateMyTickets).toHaveBeenCalled();
  });

  it("StaffDashboardView metric cards have descriptive aria-labels and keyboard operability", async () => {
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue({
      metrics: {
        myAssigned: 3,
        newTickets: 2,
        openTickets: 4,
        inProgress: 1,
        waitingForRequester: 1,
        byPriority: { URGENT: 1, HIGH: 2, MEDIUM: 1, LOW: 0 },
      },
      recentTickets: [],
      quickStats: { unassignedTickets: 2 },
    });

    localStorage.setItem("toktickit_auth_token", "fake-staff-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockStaffUser));

    const onNavigateQueue = vi.fn();

    render(
      <AuthProvider>
        <RequesterProvider>
          <StaffDashboardView onSelectTicket={vi.fn()} onNavigateQueue={onNavigateQueue} />
        </RequesterProvider>
      </AuthProvider>
    );

    const unassignedCard = await screen.findByRole("button", { name: /unassigned tickets: 2/i });
    expect(unassignedCard).toBeInTheDocument();

    fireEvent.keyDown(unassignedCard, { key: " " });
    expect(onNavigateQueue).toHaveBeenCalledWith({ ownerFilter: "unassigned" });
  });

  it("ActionsTakenSection modal renders dialog ARIA roles and accessible titles", async () => {
    vi.mocked(api.fetchActionsTaken).mockResolvedValue([]);

    localStorage.setItem("toktickit_auth_token", "fake-staff-token");
    localStorage.setItem("toktickit_auth_user", JSON.stringify(mockStaffUser));

    render(
      <AuthProvider>
        <RequesterProvider>
          <ActionsTakenSection ticketId={101} />
        </RequesterProvider>
      </AuthProvider>
    );

    const addBtn = await screen.findByTestId("add-action-taken-btn");
    fireEvent.click(addBtn);

    const modal = screen.getByTestId("action-modal");
    expect(modal).toHaveAttribute("role", "dialog");
    expect(modal).toHaveAttribute("aria-modal", "true");
    expect(modal).toHaveAttribute("aria-labelledby", "action-modal-title");
  });
});
