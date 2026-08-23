import React, { useState } from "react";
import "./zen-green.css";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { AppHeader } from "./components/AppHeader.js";
import { DevelopmentRequesterSelector } from "./components/DevelopmentRequesterSelector.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";

function AppContent() {
  const { selectedRequester, isLoading } = useRequester();
  const [currentView, setCurrentView] = useState<string>("create-ticket");

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <AppHeader currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-grow-1">
        {!selectedRequester ? (
          <DevelopmentRequesterSelector />
        ) : (
          <div>
            {currentView === "create-ticket" && (
              <CreateTicketForm
                onSuccessViewMyTickets={() => setCurrentView("my-tickets")}
                onCancel={() => setCurrentView("my-tickets")}
              />
            )}

            {currentView === "my-tickets" && (
              <div className="container py-4">
                <div className="zen-card p-4 text-center py-5">
                  <h2 className="h5 fw-semibold mb-2">My Tickets</h2>
                  <p className="text-muted small mb-3">
                    My Tickets list view will be implemented in Issue #16.
                  </p>
                  <button
                    className="btn zen-btn-primary"
                    onClick={() => setCurrentView("create-ticket")}
                  >
                    ➕ Create IT Support Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RequesterProvider>
      <AppContent />
    </RequesterProvider>
  );
}
