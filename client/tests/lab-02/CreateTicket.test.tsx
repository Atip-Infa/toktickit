import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "../../src/App.js";

const mockRequesters = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@kmutt.ac.th",
    department: "Computer Engineering",
    isActive: true,
  },
];

const mockCategories = [
  { id: 1, name: "Account and Access" },
  { id: 2, name: "Hardware" },
];

const mockRelatedSystems = [
  { id: 1, name: "Email", code: "EMAIL", isActive: true },
  { id: 2, name: "Corporate Laptop", code: "LAPTOP", isActive: true },
];

describe("Create Ticket Experience (Issue #15)", () => {
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

      if (urlStr.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories),
        } as Response);
      }

      if (urlStr.includes("/api/related-systems")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockRelatedSystems }),
        } as Response);
      }

      if (urlStr.includes("/api/tickets")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                id: 101,
                ticketNumber: "TKT-2026-000101",
                requesterId: 1,
                categoryId: 1,
                relatedSystemId: 2,
                requestedPriority: "MEDIUM",
                itPriority: "MEDIUM",
                status: "NEW",
                summary: "Laptop battery drains quickly",
                description: "Detailed description of laptop issue.",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }),
        } as Response);
      }

      return Promise.reject(new Error("Unknown URL"));
    });
  });

  const navigateToCreateTicket = async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /➕ Create Ticket/i })[0]).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByRole("button", { name: /➕ Create Ticket/i })[0]);
  };

  it("renders Create Ticket form with API-loaded categories and systems", async () => {
    await navigateToCreateTicket();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Create IT Support Ticket/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Related System/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Ticket Summary/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Detailed Description/i)).toBeInTheDocument();
    });
  });

  it("displays field-level validation errors when submitting invalid inputs (UI-02, AC-04, BR-08)", async () => {
    await navigateToCreateTicket();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Submit Ticket/i })).toBeInTheDocument();
    });

    const summaryInput = screen.getByLabelText(/Ticket Summary/i);
    const descInput = screen.getByLabelText(/Detailed Description/i);

    fireEvent.change(summaryInput, { target: { value: "bad" } }); // < 5 chars
    fireEvent.change(descInput, { target: { value: "Too short" } }); // < 10 chars

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Summary is required \(min 5 characters, max 120 characters\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Description is required \(min 10 characters, max 2000 characters\)/i)
      ).toBeInTheDocument();
    });
  });

  it("submits valid form data and displays official Ticket Number (AC-01, BR-01)", async () => {
    await navigateToCreateTicket();

    await waitFor(() => {
      expect(screen.getByLabelText(/Ticket Summary/i)).toBeInTheDocument();
    });

    const summaryInput = screen.getByLabelText(/Ticket Summary/i);
    const descInput = screen.getByLabelText(/Detailed Description/i);

    fireEvent.change(summaryInput, { target: { value: "Laptop battery drains quickly" } });
    fireEvent.change(descInput, {
      target: { value: "My laptop battery is draining much faster than usual." },
    });

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Ticket Submitted Successfully!/i })
      ).toBeInTheDocument();
      expect(screen.getByText("TKT-2026-000101")).toBeInTheDocument();
    });
  });

  it("preserves entered form data on API creation error (UI-04, AC-12, BR-11)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url, opts) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/tickets") && opts?.method === "POST") {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Database connection failed" }),
        } as Response);
      }

      if (urlStr.includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockRequesters }),
        } as Response);
      }

      if (urlStr.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories),
        } as Response);
      }

      if (urlStr.includes("/api/related-systems")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockRelatedSystems }),
        } as Response);
      }

      if (urlStr.includes("/api/tickets")) {
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

    await navigateToCreateTicket();

    await waitFor(() => {
      expect(screen.getByLabelText(/Ticket Summary/i)).toBeInTheDocument();
    });

    const summaryInput = screen.getByLabelText(/Ticket Summary/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Detailed Description/i) as HTMLTextAreaElement;

    fireEvent.change(summaryInput, { target: { value: "Preserved Summary Text" } });
    fireEvent.change(descInput, {
      target: { value: "Preserved Description Text that should not be wiped on server error." },
    });

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Database connection failed/i);
    });

    expect(summaryInput.value).toBe("Preserved Summary Text");
    expect(descInput.value).toBe(
      "Preserved Description Text that should not be wiped on server error."
    );
  });
});
