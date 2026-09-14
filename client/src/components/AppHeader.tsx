import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useRequester } from "../context/RequesterContext.js";

interface AppHeaderProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView = "my-tickets",
  onNavigate = () => {},
}) => {
  const { user, logout } = useAuth();
  const { selectedRequester, clearRequester } = useRequester();
  const [showDropdown, setShowDropdown] = useState(false);

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case "ADMINISTRATOR":
        return "bg-danger text-white";
      case "IT_STAFF":
        return "bg-info text-dark";
      case "REQUESTER":
      default:
        return "bg-success bg-opacity-75 text-white";
    }
  };

  const formatRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMINISTRATOR":
        return "Administrator";
      case "IT_STAFF":
        return "IT Staff";
      case "REQUESTER":
      default:
        return "Requester";
    }
  };

  const activeRole = user?.role || (selectedRequester ? "REQUESTER" : undefined);

  return (
    <header
      className="navbar navbar-expand-lg navbar-dark shadow-sm px-3 px-lg-4"
      style={{ backgroundColor: "#055037" }}
    >
      <div className="container-fluid px-0">
        {/* Brand Logo & Name */}
        <button
          className="navbar-brand border-0 bg-transparent d-flex align-items-center gap-2 p-0 text-white fw-bold me-4"
          onClick={() => {
            if (activeRole === "REQUESTER") onNavigate("my-tickets");
            else if (activeRole === "IT_STAFF") onNavigate("staff-queue");
            else if (activeRole === "ADMINISTRATOR") onNavigate("user-management");
          }}
          style={{ cursor: "pointer" }}
        >
          <span className="fs-4">⏱️</span>
          <span className="fs-4 tracking-tight">TokTickIT</span>
        </button>

        {/* Role-Based Navigation Links */}
        <div className="d-flex align-items-center gap-2 me-auto">
          {activeRole === "REQUESTER" && (
            <>
              <button
                className={`btn btn-sm px-3 rounded-pill text-white fw-medium ${
                  currentView === "my-tickets" ? "bg-white bg-opacity-25" : "btn-link text-decoration-none opacity-75 hover-opacity-100"
                }`}
                onClick={() => onNavigate("my-tickets")}
              >
                📋 My Tickets
              </button>
              <button
                className={`btn btn-sm px-3 rounded-pill text-white fw-medium ${
                  currentView === "create-ticket" ? "bg-white bg-opacity-25" : "btn-link text-decoration-none opacity-75 hover-opacity-100"
                }`}
                onClick={() => onNavigate("create-ticket")}
              >
                ➕ Create Ticket
              </button>
            </>
          )}

          {(activeRole === "IT_STAFF" || activeRole === "ADMINISTRATOR") && (
            <button
              className={`btn btn-sm px-3 rounded-pill text-white fw-medium ${
                currentView === "staff-queue" ? "bg-white bg-opacity-25" : "btn-link text-decoration-none opacity-75 hover-opacity-100"
              }`}
              onClick={() => onNavigate("staff-queue")}
            >
              📋 IT Ticket Queue
            </button>
          )}

          {activeRole === "ADMINISTRATOR" && (
            <button
              className={`btn btn-sm px-3 rounded-pill text-white fw-medium ${
                currentView === "user-management" ? "bg-white bg-opacity-25" : "btn-link text-decoration-none opacity-75 hover-opacity-100"
              }`}
              onClick={() => onNavigate("user-management")}
            >
              👥 User Management
            </button>
          )}
        </div>

        {/* User Identity Profile & Logout / Dev Requester Dropdown */}
        {user ? (
          <div className="d-flex align-items-center gap-3 ms-auto">
            <div className="d-flex align-items-center gap-2 text-white">
              <div
                className="rounded-circle bg-white text-success fw-bold d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px", fontSize: "14px", color: "#055037" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="d-none d-sm-block text-end">
                <div className="fw-semibold fs-7 leading-tight">{user.name}</div>
                <span className={`badge rounded-pill px-2 py-1 fs-8 ${getRoleBadgeClass(user.role)}`}>
                  {formatRoleLabel(user.role)}
                </span>
              </div>
            </div>

            <button
              className="btn btn-outline-light btn-sm rounded-3 px-3 fw-medium"
              onClick={() => logout()}
              title="Sign out of TokTickIT"
            >
              Logout
            </button>
          </div>
        ) : selectedRequester ? (
          <div className="position-relative ms-auto">
            <button
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 gap-sm-2 text-nowrap"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-expanded={showDropdown}
            >
              <span className="fw-semibold text-truncate d-inline-block" style={{ maxWidth: "220px" }}>
                {selectedRequester.name}
              </span>
              <span className="small opacity-75">▾</span>
            </button>

            {showDropdown && (
              <div
                className="dropdown-menu dropdown-menu-end show mt-2 shadow"
                style={{ position: "absolute", right: 0, top: "100%", zIndex: 1000, minWidth: "200px" }}
              >
                <div className="dropdown-header">
                  <strong>{selectedRequester.name}</strong>
                  <div className="text-muted extra-small text-truncate">{selectedRequester.email}</div>
                  <div className="text-muted extra-small text-truncate">{selectedRequester.department}</div>
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
        ) : null}
      </div>
    </header>
  );
};
