import React, { useState, useEffect } from "react";
import { fetchStaffDashboard, StaffDashboardResponse, Ticket } from "../api.js";
import { useAuth } from "../context/AuthContext.js";

interface StaffDashboardViewProps {
  onSelectTicket: (ticketId: number) => void;
  onNavigateQueue: (filters?: { status?: string; ownerFilter?: string; priority?: string }) => void;
}

export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({
  onSelectTicket,
  onNavigateQueue,
}) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<StaffDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboard = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await fetchStaffDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load staff dashboard operational metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const renderStatusBadge = (st: string) => {
    switch (st) {
      case "NEW":
        return <span className="badge bg-primary">NEW</span>;
      case "OPEN":
        return <span className="badge bg-info text-dark">OPEN</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-warning text-dark">IN PROGRESS</span>;
      case "WAITING_FOR_REQUESTER":
        return <span className="badge bg-secondary">WAITING FOR REQUESTER</span>;
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

  const renderPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT":
        return <span className="badge bg-danger">URGENT</span>;
      case "HIGH":
        return <span className="badge bg-warning text-dark">HIGH</span>;
      case "MEDIUM":
        return <span className="badge bg-info text-dark">MEDIUM</span>;
      case "LOW":
        return <span className="badge bg-light text-dark border">LOW</span>;
      default:
        return <span className="badge bg-secondary">{p}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="zen-card p-5">
          <div className="spinner-border text-success" role="status" style={{ color: "#055037" }}>
            <span className="visually-hidden">Loading staff dashboard...</span>
          </div>
          <p className="small text-muted mt-3">Loading staff dashboard operational metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container py-5">
        <div className="zen-card p-4 text-center">
          <div className="text-danger fw-bold mb-2">Unable to Load Operational Dashboard</div>
          <p className="text-muted small mb-3">{error || "Failed to load dashboard metrics."}</p>
          <button className="btn zen-btn-primary btn-sm" onClick={() => loadDashboard()}>
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { metrics, recentTickets, quickStats } = dashboardData;

  return (
    <div className="container py-4" style={{ maxWidth: "1200px" }}>
      {/* Header Greeting & Action Bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center border-bottom pb-3 mb-4 gap-2">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">
            Welcome back, {user?.name || "IT Staff"}!
          </h1>
          <p className="text-muted small mb-0">
            Here's what's happening with your operational service desk queue today.
          </p>
        </div>
        <div>
          <button
            className="btn btn-outline-success btn-sm font-semibold d-flex align-items-center gap-1"
            disabled={refreshing}
            onClick={() => loadDashboard(true)}
          >
            {refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                Refreshing...
              </>
            ) : (
              "🔄 Refresh Data"
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards Row - Responsive Grid */}
      <div className="row g-3 mb-4">
        {/* Unassigned Tickets */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateQueue({ ownerFilter: "unassigned" })}
            style={{ cursor: "pointer", borderTop: "4px solid #dc3545" }}
            role="button"
            tabIndex={0}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">Unassigned</div>
            <div className="display-6 fw-bold text-danger mb-1">{quickStats.unassignedTickets}</div>
            <div className="extra-small text-muted">Action Needed</div>
          </div>
        </div>

        {/* My Assigned */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateQueue({ ownerFilter: "me" })}
            style={{ cursor: "pointer", borderTop: "4px solid #055037" }}
            role="button"
            tabIndex={0}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">My Assigned</div>
            <div className="display-6 fw-bold text-success mb-1" style={{ color: "#055037" }}>
              {metrics.myAssigned}
            </div>
            <div className="extra-small text-muted">Owned by You</div>
          </div>
        </div>

        {/* New */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateQueue({ status: "NEW" })}
            style={{ cursor: "pointer", borderTop: "4px solid #0d6efd" }}
            role="button"
            tabIndex={0}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">New</div>
            <div className="display-6 fw-bold text-primary mb-1">{metrics.newTickets}</div>
            <div className="extra-small text-muted">Awaiting Triage</div>
          </div>
        </div>

        {/* Open */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateQueue({ status: "OPEN" })}
            style={{ cursor: "pointer", borderTop: "4px solid #0dcaf0" }}
            role="button"
            tabIndex={0}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">Open</div>
            <div className="display-6 fw-bold text-info mb-1">{metrics.openTickets}</div>
            <div className="extra-small text-muted">Active Queue</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateQueue({ status: "IN_PROGRESS" })}
            style={{ cursor: "pointer", borderTop: "4px solid #ffc107" }}
            role="button"
            tabIndex={0}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">In Progress</div>
            <div className="display-6 fw-bold text-warning mb-1">{metrics.inProgress}</div>
            <div className="extra-small text-muted">Work Underway</div>
          </div>
        </div>

        {/* Waiting for Requester */}
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <div
            className="zen-card p-3 h-100 text-center cursor-pointer hover-shadow"
            onClick={() => onNavigateQueue({ status: "WAITING_FOR_REQUESTER" })}
            style={{ cursor: "pointer", borderTop: "4px solid #6c757d" }}
            role="button"
            tabIndex={0}
          >
            <div className="text-uppercase extra-small text-muted fw-bold mb-1">Pending Client</div>
            <div className="display-6 fw-bold text-secondary mb-1">{metrics.waitingForRequester}</div>
            <div className="extra-small text-muted">Waiting Response</div>
          </div>
        </div>
      </div>

      {/* IT Priority Breakdown Row */}
      {metrics.byPriority && (
        <div className="zen-card p-3 mb-4">
          <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            🎯 Active Tickets by IT Priority
          </h2>
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <button
                className="btn btn-outline-danger w-100 py-2 d-flex justify-content-between align-items-center"
                onClick={() => onNavigateQueue({ priority: "URGENT" })}
              >
                <span className="fw-semibold small">🔴 URGENT</span>
                <span className="badge bg-danger text-white fs-6">{metrics.byPriority.URGENT || 0}</span>
              </button>
            </div>
            <div className="col-6 col-md-3">
              <button
                className="btn btn-outline-warning text-dark w-100 py-2 d-flex justify-content-between align-items-center"
                onClick={() => onNavigateQueue({ priority: "HIGH" })}
              >
                <span className="fw-semibold small">🟠 HIGH</span>
                <span className="badge bg-warning text-dark fs-6">{metrics.byPriority.HIGH || 0}</span>
              </button>
            </div>
            <div className="col-6 col-md-3">
              <button
                className="btn btn-outline-info text-dark w-100 py-2 d-flex justify-content-between align-items-center"
                onClick={() => onNavigateQueue({ priority: "MEDIUM" })}
              >
                <span className="fw-semibold small">🔵 MEDIUM</span>
                <span className="badge bg-info text-dark fs-6">{metrics.byPriority.MEDIUM || 0}</span>
              </button>
            </div>
            <div className="col-6 col-md-3">
              <button
                className="btn btn-outline-secondary w-100 py-2 d-flex justify-content-between align-items-center"
                onClick={() => onNavigateQueue({ priority: "LOW" })}
              >
                <span className="fw-semibold small">⚪ LOW</span>
                <span className="badge bg-secondary text-white fs-6">{metrics.byPriority.LOW || 0}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout (2 Columns) */}
      <div className="row g-4">
        {/* Left Column: Recent Assigned / Queue Tickets */}
        <div className="col-12 col-lg-8">
          <div className="zen-card p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h2 className="h6 fw-bold mb-0">🕒 Recently Updated Tickets</h2>
              <button
                className="btn btn-link btn-sm p-0 text-success text-decoration-none extra-small fw-semibold"
                onClick={() => onNavigateQueue({ ownerFilter: "me" })}
              >
                View My Assigned Queue →
              </button>
            </div>

            {recentTickets.length === 0 ? (
              <div className="text-center py-5 text-muted rounded bg-light">
                <div className="fs-3 mb-2">📋</div>
                <div className="fw-semibold small">No Recent Tickets Found</div>
                <div className="extra-small">No recent tickets assigned or active in your queue.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light extra-small text-muted">
                    <tr>
                      <th scope="col">Ticket Number</th>
                      <th scope="col">Summary</th>
                      <th scope="col">Status</th>
                      <th scope="col">Priority</th>
                      <th scope="col">Owner</th>
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
                          <div className="small fw-semibold text-dark text-truncate" style={{ maxWidth: "220px" }}>
                            {t.summary}
                          </div>
                        </td>
                        <td>{renderStatusBadge(t.status)}</td>
                        <td>{renderPriorityBadge(t.itPriority || t.requestedPriority)}</td>
                        <td className="small text-muted">
                          {t.owner ? t.owner.name : <span className="fst-italic text-danger">Unassigned</span>}
                        </td>
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

        {/* Right Column: Quick Actions & Operational Overview */}
        <div className="col-12 col-lg-4">
          <div className="zen-card p-4 mb-4">
            <h2 className="h6 fw-bold mb-3">⚡ Quick Operational Shortcuts</h2>
            <div className="d-grid gap-2">
              <button
                className="btn zen-btn-primary btn-sm text-start py-2 d-flex align-items-center gap-2"
                onClick={() => onNavigateQueue()}
              >
                <span>📋</span> View Complete IT Ticket Queue
              </button>
              <button
                className="btn btn-outline-success btn-sm text-start py-2 d-flex align-items-center gap-2"
                onClick={() => onNavigateQueue({ ownerFilter: "me" })}
              >
                <span>👤</span> Filter My Assigned Tickets
              </button>
              <button
                className="btn btn-outline-danger btn-sm text-start py-2 d-flex align-items-center gap-2"
                onClick={() => onNavigateQueue({ ownerFilter: "unassigned" })}
              >
                <span>🚨</span> Review Unassigned Tickets Queue
              </button>
            </div>
          </div>

          {/* Administrator Extra Widget */}
          {user?.role === "ADMINISTRATOR" && quickStats.totalUsers !== undefined && (
            <div className="zen-card p-4">
              <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                👥 System User Accounts
              </h2>
              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="p-3 bg-light rounded border">
                    <div className="extra-small text-muted font-monospace">TOTAL USERS</div>
                    <div className="h4 fw-bold text-dark mb-0">{quickStats.totalUsers}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-success-subtle rounded border border-success-subtle">
                    <div className="extra-small text-success font-monospace">ACTIVE USERS</div>
                    <div className="h4 fw-bold text-success mb-0">{quickStats.activeUsers}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
