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
  {
    id: 2,
    name: "David Lee",
    email: "david.l@kmutt.ac.th",
    department: "Information Technology",
    isActive: true,
  },
];

describe("Development Requester Selection Screen & Context", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (String(url).includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockRequesters }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });
  });

  it("renders Development Requester selector title and notice text", async () => {
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Select Development Requester/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Choose a development requester to simulate the current requester context/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Only active development requesters are shown/i)
    ).toBeInTheDocument();
  });

  it("selects a requester and sets active session context", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Development Requester/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Development Requester/i);
    fireEvent.change(select, { target: { value: "1" } });

    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Jennifer Anderson/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem("toktickit_dev_requester_id")).toBe("1");
  });

  it("allows changing requester context", async () => {
    localStorage.setItem("toktickit_dev_requester_id", "1");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Jennifer Anderson/i)).toBeInTheDocument();
    });

    const userBtn = screen.getByRole("button", { name: /Jennifer Anderson/i });
    fireEvent.click(userBtn);

    const changeBtn = screen.getByRole("button", { name: /Change Requester/i });
    fireEvent.click(changeBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Select Development Requester/i })
      ).toBeInTheDocument();
    });
    expect(localStorage.getItem("toktickit_dev_requester_id")).toBeNull();
  });
});
