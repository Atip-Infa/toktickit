import React, { useState, useEffect } from "react";
import { fetchRequesterDashboard, RequesterDashboardResponse, Ticket } from "../api.js";
import { useAuth } from "../context/AuthContext.js";
import { useRequester } from "../context/RequesterContext.js";

interface RequesterDashboardViewProps {
  onCreateTicketClick: () => void;
  onSelectTicket: (ticketId: number) => void;
  onNavigateMyTickets: (statusFilter?: string) => void;
}

export const RequesterDashboardView: React.FC<RequesterDashboardViewProps> = ({
  onCreateTicketClick,
  onSelectTicket,
  onNavigateMyTickets,
}) => {
  const { user } = useAuth();
  const { selectedRequester } = useRequester();

  const [dashboardData, setDashboardData] = useState<RequesterDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const activeRequesterId = user?.id || selectedRequester?.id;

  const loadDashboard = async (isManualRefresh = false) => {
    if (!activeRequesterId && !user) return;

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await fetchRequesterDashboard(selectedRequester?.id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activeRequesterId]);

  const renderStatusBadge = (st: string) => {
    switch (st) {
      case "NEW":
        return <span className="badge bg-primary">NEW</span>;
      case "OPEN":
        return <span className="badge bg-info text-dark">OPEN</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-warning text-dark">IN PROGRESS</span>;
      case "WAITING_FOR_REQUESTER":
        return <span className="badge bg-secondary">WAITING FOR YOUR RESPONSE</span>;
      case "RESOLVED":
        return <span className="badge bg-success">RESOLVED</span>;
      case "CLOSED":
        return <span className="badge bg-dark">CLOSED</span>;
      case "CANCELLED":
        return <span className="badge bg-danger">CANCELLED</span>;
      default:
        return <span className="badge bg-secondary">{st}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="zen-card p-5">
          <div className="spinner-border text-success" role="status" style={{ color: "#055037" }}>
            <span className="visually-hidden">Loading dashboard...</span>
          </div>
          <p className="small text-muted mt-3">Loading your request summary...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container py-5">
        <div className="zen-card p-4 text-center">
          <div className="text-danger fw-bold mb-2">Unable to Load Dashboard</div>
          <p className="text-muted small mb-3">{error || "Failed to load requester summary."}</p>
          <button className="btn zen-btn-primary btn-sm" onClick={() => loadDashboard()}>
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {
    totalTickets: 0,
    openTickets: 0,
    inProgress: 0,
    waitingForRequester: 0,
    resolved: 0,
    closed: 0,
  };
  const recentTickets = dashboardData?.recentTickets || [];
  const recentlyResolvedTickets = dashboardData?.recentlyResolvedTickets || [];
  const requiringAttention = dashboardData?.requiringAttention || [];
  const requesterName = user?.name || selectedRequester?.name || "Requester";

  return (
    <div className="container py-4" style={{ maxWidth: "1200px" }}>
      {/* Header Greeting & Action Bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center border-bottom pb-3 mb-4 gap-2">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">
            Welcome, {requesterName}!
          </h1>
          <p className="text-muted small mb-0">
            Here's the latest summary of your IT service requests.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn zen-btn-primary btn-sm font-semibold d-flex align-items-center gap-1"
            onClick={onCreateTicketClick}
          >
            ➕ Create Ticket
          </button>
          <button
            className="btn btn-outline-success btn-sm font-semibold d-flex align-items-center gap-1"
            disabled={refreshing}
            onClick={() => loadDashboard(true)}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* Action Required Banner (If tickets waiting for requester response) */}
      {requiringAttention.length > 0 && (
        <div className="alert alert-warning border-warning shadow-sm mb-4 p-3 rounded">
          <div className="d-flex align-items-start gap-3">
            <span className="fs-4">⚠️</span>
            <div className="flex-grow-1">
              <h2 className="h6 fw-bold text-dark mb-1">
                Action Required: IT Staff are waiting for your response ({requiringAttention.length})
              </h2>
              <p className="extra-small text-muted mb-2">
                Please review and respond to IT Staff comments so work can proceed.
              </p>
              <div className="d-flex flex-column gap-2">
                {requiringAttention.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 bg-white rounded border d-flex justify-content-between align-items-center gap-2"
                  >
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <span className="font-monospace fw-bold text-success small">{t.ticketNumber}</span>
                      <span className="small fw-semibold text-truncate">{t.summary}</span>
                    </div>
                    <button
                      className="btn btn-sm btn-warning text-dark py-0 px-2 extra-small font-semibold text-nowrap"
                      onClick={() => onSelectTicket(t.id)}
                    >
                      Respond Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Row - Responsive Grid */}
      <div className="row g-3 mb-4">
        {/* Total Tickets */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateMyTickets()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateMyTickets(); } }}
            style={{ cursor: "pointer", borderTop: "4px solid #055037" }}
            role="button"
            tabIndex={0}
            aria-label={`Total Tickets: ${metrics.totalTickets}`}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">Total Tickets</div>
            <div className="display-6 fw-bold text-dark mb-1">{metrics.totalTickets}</div>
            <div className="extra-small text-muted">All Submitted</div>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateMyTickets("OPEN")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateMyTickets("OPEN"); } }}
            style={{ cursor: "pointer", borderTop: "4px solid #0d6efd" }}
            role="button"
            tabIndex={0}
            aria-label={`Open Tickets: ${metrics.openTickets}`}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">Open Tickets</div>
            <div className="display-6 fw-bold text-primary mb-1">{metrics.openTickets}</div>
            <div className="extra-small text-muted">Active Request</div>
          </div>
        </div>

        {/* Waiting for Requester */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateMyTickets("WAITING_FOR_REQUESTER")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateMyTickets("WAITING_FOR_REQUESTER"); } }}
            style={{ cursor: "pointer", borderTop: "4px solid #ffc107" }}
            role="button"
            tabIndex={0}
            aria-label={`Needs Response: ${metrics.waitingForRequester}`}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">Needs Response</div>
            <div className="display-6 fw-bold text-warning mb-1">{metrics.waitingForRequester}</div>
            <div className="extra-small text-muted">Waiting on You</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateMyTickets("IN_PROGRESS")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateMyTickets("IN_PROGRESS"); } }}
            style={{ cursor: "pointer", borderTop: "4px solid #0dcaf0" }}
            role="button"
            tabIndex={0}
            aria-label={`In Progress: ${metrics.inProgress}`}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">In Progress</div>
            <div className="display-6 fw-bold text-info mb-1">{metrics.inProgress}</div>
            <div className="extra-small text-muted">Work Underway</div>
          </div>
        </div>

        {/* Resolved */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateMyTickets("RESOLVED")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateMyTickets("RESOLVED"); } }}
            style={{ cursor: "pointer", borderTop: "4px solid #198754" }}
            role="button"
            tabIndex={0}
            aria-label={`Resolved: ${metrics.resolved}`}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">Resolved</div>
            <div className="display-6 fw-bold text-success mb-1">{metrics.resolved}</div>
            <div className="extra-small text-muted">Problem Fixed</div>
          </div>
        </div>

        {/* Closed */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateMyTickets("CLOSED")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateMyTickets("CLOSED"); } }}
            style={{ cursor: "pointer", borderTop: "4px solid #212529" }}
            role="button"
            tabIndex={0}
            aria-label={`Closed: ${metrics.closed}`}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">Closed</div>
            <div className="display-6 fw-bold text-dark mb-1">{metrics.closed}</div>
            <div className="extra-small text-muted">Completed</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout (2 Columns) */}
      <div className="row g-4">
        {/* Left Column: Recently Updated Tickets */}
        <div className="col-12 col-lg-8">
          <div className="zen-card p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h2 className="h6 fw-bold mb-0">🕒 Recently Updated Requests</h2>
              <button
                className="btn btn-link btn-sm p-0 text-success text-decoration-none extra-small fw-semibold"
                onClick={() => onNavigateMyTickets()}
              >
                View All My Tickets →
              </button>
            </div>

            {recentTickets.length === 0 ? (
              <div className="text-center py-5 text-muted rounded bg-light">
                <div className="fs-3 mb-2">📋</div>
                <div className="fw-semibold small">No Requests Found</div>
                <div className="extra-small mb-3">You haven't submitted any service tickets yet.</div>
                <button className="btn zen-btn-primary btn-sm" onClick={onCreateTicketClick}>
                  ➕ Create First Ticket
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light extra-small text-muted">
                    <tr>
                      <th scope="col">Ticket Number</th>
                      <th scope="col">Summary</th>
                      <th scope="col">Category</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((t: Ticket) => (
                      <tr
                        key={t.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => onSelectTicket(t.id)}
                      >
                        <td>
                          <span className="font-monospace fw-bold text-success small">
                            {t.ticketNumber}
                          </span>
                        </td>
                        <td>
                          <div className="small fw-semibold text-dark text-truncate" style={{ maxWidth: "240px" }}>
                            {t.summary}
                          </div>
                        </td>
                        <td className="small text-muted">{t.category?.name || "General"}</td>
                        <td>{renderStatusBadge(t.status)}</td>
                        <td className="text-end small text-muted">
                          {new Date(t.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recently Resolved & Quick Actions */}
        <div className="col-12 col-lg-4">
          {/* Quick Actions Panel */}
          <div className="zen-card p-4 mb-4">
            <h2 className="h6 fw-bold mb-3">⚡ Quick Actions</h2>
            <div className="d-grid gap-2">
              <button
                className="btn zen-btn-primary btn-sm text-start py-2 d-flex align-items-center gap-2"
                onClick={onCreateTicketClick}
              >
                <span>➕</span> Create New Ticket
              </button>
              <button
                className="btn btn-outline-success btn-sm text-start py-2 d-flex align-items-center gap-2"
                onClick={() => onNavigateMyTickets()}
              >
                <span>📋</span> View All My Tickets
              </button>
            </div>
          </div>

          {/* Recently Resolved Panel */}
          {recentlyResolvedTickets.length > 0 && (
            <div className="zen-card p-4">
              <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                ✅ Recently Resolved Requests
              </h2>
              <div className="d-flex flex-column gap-2">
                {recentlyResolvedTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 bg-light rounded border d-flex justify-content-between align-items-center gap-2 cursor-pointer"
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectTicket(t.id)}
                  >
                    <div className="overflow-hidden">
                      <div className="font-monospace extra-small fw-bold text-success">{t.ticketNumber}</div>
                      <div className="extra-small text-dark text-truncate fw-semibold">{t.summary}</div>
                    </div>
                    <span className="badge bg-success extra-small">RESOLVED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
