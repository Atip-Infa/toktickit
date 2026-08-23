import React, { useState } from "react";
import "./zen-green.css";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { AppHeader } from "./components/AppHeader.js";
import { DevelopmentRequesterSelector } from "./components/DevelopmentRequesterSelector.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTicketsView } from "./components/MyTicketsView.js";

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
          <div>
            {currentView === "my-tickets" && (
              <MyTicketsView
                onCreateTicketClick={() => setCurrentView("create-ticket")}
              />
            )}

            {currentView === "create-ticket" && (
              <CreateTicketForm
                onSuccessViewMyTickets={() => setCurrentView("my-tickets")}
                onCancel={() => setCurrentView("my-tickets")}
              />
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
