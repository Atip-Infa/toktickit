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
import { RequesterDashboardView } from "./components/RequesterDashboardView.js";
import { getAuthToken } from "./api.js";

import { StaffTicketQueueView } from "./components/StaffTicketQueueView.js";
import { StaffTicketDetailView } from "./components/StaffTicketDetailView.js";
import { StaffDashboardView } from "./components/StaffDashboardView.js";
import { UserManagementView } from "./components/UserManagementView.js";

function MainApp() {
  const { user, isLoading } = useAuth();
  const { selectedRequester } = useRequester();
  const [currentView, setCurrentView] = useState<string>("my-tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [myTicketsStatusFilter, setMyTicketsStatusFilter] = useState<string>("");
  const [queueFilters, setQueueFilters] = useState<{ status?: string; ownerFilter?: string; priority?: string }>({});
  const [authMode, setAuthMode] = useState<"login" | "dev-selector">(() => {
    return getAuthToken() ? "login" : "dev-selector";
  });

  useEffect(() => {
    if (user) {
      if (user.role === "REQUESTER") {
        setCurrentView("requester-dashboard");
      } else if (user.role === "IT_STAFF" || user.role === "ADMINISTRATOR") {
        setCurrentView("staff-dashboard");
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
    if (authMode === "dev-selector") {
      return <DevelopmentRequesterSelector onSwitchToLogin={() => setAuthMode("login")} />;
    }
    return <LoginView />;
  }

  if (user && user.mustChangePassword) {
    return <ChangePasswordView />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <AppHeader currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-grow-1">
        {currentView === "requester-dashboard" && (
          <RequesterDashboardView
            onCreateTicketClick={() => setCurrentView("create-ticket")}
            onSelectTicket={(ticketId) => {
              setSelectedTicketId(ticketId);
              setCurrentView("ticket-detail");
            }}
            onNavigateMyTickets={(statusFilter) => {
              setMyTicketsStatusFilter(statusFilter || "");
              setCurrentView("my-tickets");
            }}
          />
        )}

        {currentView === "my-tickets" && (
          <MyTicketsView
            initialStatus={myTicketsStatusFilter}
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

        {currentView === "staff-dashboard" && (
          <StaffDashboardView
            onSelectTicket={(ticketId) => {
              setSelectedTicketId(ticketId);
              setCurrentView("staff-ticket-detail");
            }}
            onNavigateQueue={(filters) => {
              setQueueFilters(filters || {});
              setCurrentView("staff-queue");
            }}
          />
        )}

        {currentView === "staff-queue" && (
          <StaffTicketQueueView
            initialStatus={queueFilters.status || ""}
            initialOwnerFilter={queueFilters.ownerFilter || ""}
            initialPriority={queueFilters.priority || ""}
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
