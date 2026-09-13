import React, { useState, useEffect } from "react";
import "./zen-green.css";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { AppHeader } from "./components/AppHeader.js";
import { LoginView } from "./components/LoginView.js";
import { ChangePasswordView } from "./components/ChangePasswordView.js";
import { DevelopmentRequesterSelector } from "./components/DevelopmentRequesterSelector.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTicketsView } from "./components/MyTicketsView.js";
import { TicketDetailView } from "./components/TicketDetailView.js";
import { getAuthToken } from "./api.js";

import { StaffTicketQueueView } from "./components/StaffTicketQueueView.js";
import { StaffTicketDetailView } from "./components/StaffTicketDetailView.js";
import { UserManagementView } from "./components/UserManagementView.js";

function MainApp() {
  const { user, isLoading } = useAuth();
  const { selectedRequester } = useRequester();
  const [currentView, setCurrentView] = useState<string>("my-tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "dev-selector">(() => {
    return getAuthToken() ? "login" : "dev-selector";
  });

  useEffect(() => {
    if (user) {
      if (user.role === "REQUESTER") {
        setCurrentView("my-tickets");
      } else if (user.role === "IT_STAFF") {
        setCurrentView("staff-queue");
      } else if (user.role === "ADMINISTRATOR") {
        setCurrentView("user-management");
      }
    }
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-success mb-2" role="status" style={{ color: "#055037" }}>
            <span className="visually-hidden">Loading session...</span>
          </div>
          <div className="text-muted fs-7">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  if (!user && !selectedRequester) {
    if (authMode === "login") {
      return (
        <div>
          <LoginView />
          <div className="text-center py-2 bg-light border-top">
            <button
              className="btn btn-link btn-sm text-decoration-none text-secondary"
              onClick={() => setAuthMode("dev-selector")}
            >
              Switch to Simulated Development Requester (Lab 2 Mode)
            </button>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="bg-light py-2 text-center border-bottom">
          <button
            className="btn btn-link btn-sm text-decoration-none text-success fw-semibold"
            onClick={() => setAuthMode("login")}
          >
            🔒 Switch to Real Login (Lab 3)
          </button>
        </div>
        <DevelopmentRequesterSelector />
      </div>
    );
  }

  if (user && user.mustChangePassword) {
    return <ChangePasswordView />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <AppHeader currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-grow-1">
        {currentView === "my-tickets" && (
          <MyTicketsView
            onCreateTicketClick={() => setCurrentView("create-ticket")}
            onSelectTicket={(ticketId) => {
              setSelectedTicketId(ticketId);
              setCurrentView("ticket-detail");
            }}
          />
        )}

        {currentView === "create-ticket" && (
          <CreateTicketForm
            onSuccessViewMyTickets={() => setCurrentView("my-tickets")}
            onCancel={() => setCurrentView("my-tickets")}
          />
        )}

        {currentView === "ticket-detail" && selectedTicketId && (
          <TicketDetailView
            ticketId={selectedTicketId}
            onBack={() => setCurrentView("my-tickets")}
          />
        )}

        {currentView === "staff-queue" && (
          <StaffTicketQueueView
            onSelectTicket={(ticketId) => {
              setSelectedTicketId(ticketId);
              setCurrentView("staff-ticket-detail");
            }}
          />
        )}

        {currentView === "staff-ticket-detail" && selectedTicketId && (
          <StaffTicketDetailView
            ticketId={selectedTicketId}
            onBack={() => setCurrentView("staff-queue")}
          />
        )}

        {currentView === "user-management" && <UserManagementView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RequesterProvider>
        <MainApp />
      </RequesterProvider>
    </AuthProvider>
  );
}
