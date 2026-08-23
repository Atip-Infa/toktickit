import React, { useState } from "react";
import "./zen-green.css";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { AppHeader } from "./components/AppHeader.js";
import { DevelopmentRequesterSelector } from "./components/DevelopmentRequesterSelector.js";

function AppContent() {
  const { selectedRequester, isLoading } = useRequester();
  const [currentView, setCurrentView] = useState<string>("my-tickets");

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
          <div className="container py-4">
            <div className="zen-card p-4 mb-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="badge zen-badge-active mb-2">Development Testing Session</span>
                  <h1 className="h4 fw-bold mb-1">
                    Welcome, {selectedRequester.name}
                  </h1>
                  <p className="text-muted small mb-0">
                    Department: {selectedRequester.department} | Email: {selectedRequester.email}
                  </p>
                </div>
              </div>
            </div>

            {currentView === "my-tickets" && (
              <div className="zen-card p-4 text-center py-5">
                <h2 className="h5 fw-semibold mb-2">My Tickets</h2>
                <p className="text-muted small mb-0">
                  Select a feature to continue testing context for {selectedRequester.name}.
                </p>
              </div>
            )}

            {currentView === "create-ticket" && (
              <div className="zen-card p-4 text-center py-5">
                <h2 className="h5 fw-semibold mb-2">Create Ticket</h2>
                <p className="text-muted small mb-0">
                  Create ticket form will be implemented in Issue #13.
                </p>
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
