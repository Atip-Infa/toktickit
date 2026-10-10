import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ActionsTakenSection } from "../../src/components/ActionsTakenSection.js";

const mockActionsTaken = [
  {
    id: 1,
    ticketId: 101,
    actionDate: "2025-05-12T10:30:00.000Z",
    description: "Ran diagnostic battery health check and verified power adapter output.",
    result: "Battery capacity verified degraded at 42% design capacity.",
    performedById: 2,
    performedBy: {
      id: 2,
      name: "Michael Brown",
      email: "michael@toktickit.com",
      role: "IT_STAFF",
    },
    followUpRequired: true,
    followUpNote: "Replacement battery ordered under warranty (ETA 24 hours).",
    attachmentNotes: "Refer to battery_diagnostic_log.png in attachments.",
    createdAt: "2025-05-12T10:30:00.000Z",
    updatedAt: "2025-05-12T10:30:00.000Z",
  },
];

const mockStaffUser = {
  id: 2,
  name: "Michael Brown",
  email: "michael@toktickit.com",
  role: "IT_STAFF" as const,
  mustChangePassword: false,
  isActive: true,
};

const mockRequesterUser = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer@toktickit.com",
  role: "REQUESTER" as const,
  mustChangePassword: false,
  isActive: true,
};

let currentMockUser: any = mockStaffUser;

vi.mock("../../src/context/AuthContext.js", () => ({
  useAuth: () => ({
    user: currentMockUser,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

describe("ActionsTakenSection Component (Lab 4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockUser = mockStaffUser;
  });

  it("renders loading state initially", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    render(<ActionsTakenSection ticketId={101} />);
    expect(screen.getByTestId("actions-loading")).toBeInTheDocument();
  });

  it("renders empty state when no actions taken exist", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (String(url).includes("/actions-taken")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ actionsTaken: [] }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<ActionsTakenSection ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByTestId("actions-empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText(/No Actions Taken Recorded/i)).toBeInTheDocument();
  });

  it("renders failure state and permits retry when API call fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Failed to connect to backend server" }),
      } as Response)
    );

    render(<ActionsTakenSection ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByTestId("actions-error-alert")).toBeInTheDocument();
    });
    expect(screen.getByText(/Failed to connect to backend server/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
  });

  it("renders Actions Taken list with date, performer, description, result, follow-up note, and attachment notes", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (String(url).includes("/actions-taken")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ actionsTaken: mockActionsTaken }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<ActionsTakenSection ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByTestId("action-card-1")).toBeInTheDocument();
    });

    expect(screen.getByText("Michael Brown")).toBeInTheDocument();
    expect(screen.getByTestId("action-description")).toHaveTextContent(
      "Ran diagnostic battery health check and verified power adapter output."
    );
    expect(screen.getByTestId("action-result")).toHaveTextContent(
      "Battery capacity verified degraded at 42% design capacity."
    );
    expect(screen.getByTestId("followup-badge-yes")).toBeInTheDocument();
    expect(screen.getByTestId("action-followup-note-box")).toHaveTextContent(
      "Replacement battery ordered under warranty (ETA 24 hours)."
    );
    expect(screen.getByTestId("action-attachment-notes-box")).toHaveTextContent(
      "Refer to battery_diagnostic_log.png in attachments."
    );
  });

  it("restricts Requesters from seeing + Add Action Taken and Edit buttons (Read-only view)", async () => {
    currentMockUser = mockRequesterUser;

    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (String(url).includes("/actions-taken")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ actionsTaken: mockActionsTaken }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<ActionsTakenSection ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByTestId("action-card-1")).toBeInTheDocument();
    });

    // Check that Add Action Taken button and Edit button are completely omitted
    expect(screen.queryByTestId("add-action-taken-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("edit-action-btn-1")).not.toBeInTheDocument();
  });

  it("allows IT Staff to open + Add Action Taken modal with performer pre-filled and validates required fields", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (String(url).includes("/actions-taken")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ actionsTaken: [] }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<ActionsTakenSection ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByTestId("add-action-taken-btn")).toBeInTheDocument();
    });

    // Click + Add Action Taken
    fireEvent.click(screen.getByTestId("add-action-taken-btn"));

    expect(screen.getByTestId("action-modal")).toBeInTheDocument();
    expect(screen.getByTestId("action-performer-input")).toHaveValue(
      "Michael Brown (IT_STAFF)"
    );

    // Submit empty form to trigger validation errors
    fireEvent.click(screen.getByTestId("save-action-btn"));

    expect(screen.getByTestId("description-error")).toHaveTextContent(
      "Action description is required."
    );
    expect(screen.getByTestId("result-error")).toHaveTextContent(
      "Action result is required."
    );
  });

  it("shows follow-up note validation when followUpRequired is checked", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (String(url).includes("/actions-taken")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ actionsTaken: [] }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<ActionsTakenSection ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByTestId("add-action-taken-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("add-action-taken-btn"));

    // Fill description and result
    fireEvent.change(screen.getByTestId("action-description-textarea"), {
      target: { value: "Replaced RAM module." },
    });
    fireEvent.change(screen.getByTestId("action-result-textarea"), {
      target: { value: "System booted normally." },
    });

    // Check followUpRequired checkbox
    const checkbox = screen.getByTestId("followup-required-checkbox");
    fireEvent.click(checkbox);

    // Follow-up note textarea should now be visible
    expect(screen.getByTestId("followup-note-textarea")).toBeInTheDocument();

    // Submit form with empty follow-up note
    fireEvent.click(screen.getByTestId("save-action-btn"));

    expect(screen.getByTestId("followup-note-error")).toHaveTextContent(
      "Follow-up note is required when follow-up is requested."
    );
  });

  it("successfully creates Action Taken and refreshes list", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation((url, options) => {
      const urlStr = String(url);
      if (urlStr.includes("/actions-taken") && (!options || options.method === "GET")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ actionsTaken: [] }),
        } as Response);
      }
      if (urlStr.includes("/actions-taken") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ actionTaken: mockActionsTaken[0] }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<ActionsTakenSection ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByTestId("add-action-taken-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("add-action-taken-btn"));

    fireEvent.change(screen.getByTestId("action-description-textarea"), {
      target: { value: "Ran battery diagnostic." },
    });
    fireEvent.change(screen.getByTestId("action-result-textarea"), {
      target: { value: "Capacity degraded." },
    });

    fireEvent.click(screen.getByTestId("save-action-btn"));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/tickets/101/actions-taken"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("opens View Details modal when clicking View Details button", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (String(url).includes("/actions-taken")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ actionsTaken: mockActionsTaken }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<ActionsTakenSection ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByTestId("view-action-btn-1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("view-action-btn-1"));

    expect(screen.getByTestId("view-action-modal")).toBeInTheDocument();
    expect(screen.getByText("Action Taken Details")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-view-modal-btn"));
    expect(screen.queryByTestId("view-action-modal")).not.toBeInTheDocument();
  });
});
