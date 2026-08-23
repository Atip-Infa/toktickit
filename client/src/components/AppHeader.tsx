import React, { useState } from "react";
import { useRequester } from "../context/RequesterContext.js";

interface AppHeaderProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView = "my-tickets",
  onNavigate = () => {},
}) => {
  const { selectedRequester, clearRequester } = useRequester();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="zen-header d-flex align-items-center justify-content-between px-3 px-md-4 py-2">
      <div className="d-flex align-items-center gap-4">
        {/* Brand */}
        <div
          className="zen-brand d-flex align-items-center gap-2 cursor-pointer"
          onClick={() => onNavigate("my-tickets")}
          style={{ cursor: "pointer" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="bi bi-clock-history"
            viewBox="0 0 16 16"
          >
            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.756.205 1.115.356l-.349.919zM1.3 6c.112-.42.261-.826.444-1.213l-.91-.418A8.002 8.002 0 0 0 .3 6H1.3zm1.614-2.614a7.003 7.003 0 0 0-.825.688l-.707-.707a8.003 8.003 0 0 1 .989-.824l.543.843zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
          </svg>
          TokTickIT
        </div>

        {/* Navigation Tabs */}
        {selectedRequester && (
          <nav className="d-flex gap-2">
            <button
              className={`btn btn-link nav-link px-3 py-1 text-white ${
                currentView === "my-tickets" ? "fw-bold border-bottom border-3 border-light" : "opacity-75"
              }`}
              onClick={() => onNavigate("my-tickets")}
            >
              📋 My Tickets
            </button>
            <button
              className={`btn btn-link nav-link px-3 py-1 text-white ${
                currentView === "create-ticket" ? "fw-bold border-bottom border-3 border-light" : "opacity-75"
              }`}
              onClick={() => onNavigate("create-ticket")}
            >
              ➕ Create Ticket
            </button>
          </nav>
        )}
      </div>

      {/* User Context & Change Requester */}
      {selectedRequester && (
        <div className="position-relative">
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-expanded={showDropdown}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-person-circle"
              viewBox="0 0 16 16"
            >
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path
                fillRule="evenodd"
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
              />
            </svg>
            <span className="fw-semibold">{selectedRequester.name}</span>
            <span className="small opacity-75">▾</span>
          </button>

          {showDropdown && (
            <div
              className="dropdown-menu dropdown-menu-end show mt-2 shadow"
              style={{ position: "absolute", right: 0, top: "100%", zIndex: 1000 }}
            >
              <div className="dropdown-header">
                <strong>{selectedRequester.name}</strong>
                <div className="text-muted extra-small">{selectedRequester.email}</div>
                <div className="text-muted extra-small">{selectedRequester.department}</div>
              </div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger d-flex align-items-center gap-2"
                onClick={() => {
                  setShowDropdown(false);
                  clearRequester();
                }}
              >
                🔄 Change Requester
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
