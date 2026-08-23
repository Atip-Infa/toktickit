import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  attachments: [
    {
      id: 10,
      ticketId: 101,
      filename: "battery_report.pdf",
      fileSize: 1048576,
      mimeType: "application/pdf",
      uploadedByRequesterId: 1,
      isRemoved: false,
      createdAt: new Date().toISOString(),
      removedAt: null,
      removalReason: null,
    },
    {
      id: 11,
      ticketId: 101,
      filename: "old_screenshot.png",
      fileSize: 524288,
      mimeType: "image/png",
      uploadedByRequesterId: 1,
      isRemoved: true,
      createdAt: new Date().toISOString(),
      removedAt: new Date().toISOString(),
      removalReason: "Uploaded wrong file",
    },
  ],
};

describe("Ticket Detail Experience (Issue #17)", () => {
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

      if (urlStr.includes("/api/attachments/10/remove")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                ...mockTicketDetail.attachments[0],
                isRemoved: true,
                removalReason: "Duplicate file",
              },
            }),
        } as Response);
      }

      return Promise.reject(new Error("Unknown route"));
    });
  });

  const renderWithContext = () => {
    return render(
      <RequesterProvider>
        <TicketDetailView ticketId={101} onBack={onBackMock} />
      </RequesterProvider>
    );
  };

  it("renders read-only ticket fields, status, priority, and attachments table (UI-08, AC-02)", async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("TKT-2026-000101")).toBeInTheDocument();
      expect(screen.getByText("Laptop battery drains quickly")).toBeInTheDocument();
      expect(screen.getByText("Detailed description of laptop issue.")).toBeInTheDocument();
      expect(screen.getByText("John Support")).toBeInTheDocument();
      expect(screen.getByText("battery_report.pdf")).toBeInTheDocument();
      expect(screen.getByText("old_screenshot.png")).toBeInTheDocument();
    });
  });

  it("renders soft-removed attachment with restriction notice and reason (UI-10, BR-16, BR-17, AC-08, AC-09)", async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Reason: "Uploaded wrong file" (Removed on 8/23/2026)')).toBeInTheDocument();
      expect(screen.getByText(/Download restricted \(Removed\)/i)).toBeInTheDocument();
    });
  });

  it("executes soft-removal workflow with removal reason prompt (UI-09, BR-15, AC-08)", async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("battery_report.pdf")).toBeInTheDocument();
    });

    const removeBtn = screen.getByRole("button", { name: /🗑️ Remove/i });
    fireEvent.click(removeBtn);

    expect(screen.getByRole("heading", { name: /Remove Attachment/i })).toBeInTheDocument();

    const reasonInput = screen.getByLabelText(/Removal Reason/i);
    fireEvent.change(reasonInput, { target: { value: "Duplicate file" } });

    const confirmBtn = screen.getByRole("button", { name: /Confirm Removal/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/attachments/10/remove"),
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("displays Access Denied card when API returns 403 (AC-03)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockRequesters }),
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: "Access denied to ticket" }),
      } as Response);
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Access denied to ticket/i);
    });
  });
});
