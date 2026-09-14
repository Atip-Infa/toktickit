import React, { useState, useEffect } from "react";
import {
  Ticket,
  Category,
  fetchCategories,
  fetchStaffTickets,
  updateStaffTicket,
} from "../api.js";
import { useAuth } from "../context/AuthContext.js";

interface StaffTicketQueueViewProps {
  onSelectTicket: (ticketId: number) => void;
}

export const StaffTicketQueueView: React.FC<StaffTicketQueueViewProps> = ({ onSelectTicket }) => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<string>(""); // "", "unassigned", "me"
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Claiming action track
  const [claimingId, setClaimingId] = useState<number | null>(null);

  // Load categories
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      let ownerIdParam: string | number | undefined = undefined;
      if (ownerFilter === "me" && user) {
        ownerIdParam = user.id;
      } else if (ownerFilter === "unassigned") {
        ownerIdParam = "unassigned";
      }

      const res = await fetchStaffTickets({
        search,
        category: selectedCategory,
        priority: selectedPriority,
        status: selectedStatus,
        ownerId: ownerIdParam,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });

      setTickets(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.totalItems);
    } catch (err: any) {
      setError(err?.message || "Failed to load IT staff tickets queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "REQUESTER") return;
    loadTickets();
  }, [search, selectedCategory, selectedPriority, selectedStatus, ownerFilter, sortBy, sortOrder, page, pageSize, user]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedPriority("");
    setSelectedStatus("");
    setOwnerFilter("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleSortClick = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleClaim = async (ticketId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (claimingId) return;

    setClaimingId(ticketId);
    try {
      await updateStaffTicket(ticketId, { ownerId: "claim", status: "IN_PROGRESS" });
      await loadTickets();
    } catch (err: any) {
      alert(err?.message || "Failed to claim ticket");
    } finally {
      setClaimingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <span className="badge bg-primary text-white">NEW</span>;
      case "ASSIGNED":
        return <span className="badge bg-info text-dark">ASSIGNED</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-warning text-dark">IN PROGRESS</span>;
      case "PENDING_CLIENT":
      case "WAITING_FOR_REQUESTER":
        return <span className="badge bg-secondary text-white">PENDING CLIENT</span>;
      case "RESOLVED":
        return <span className="badge bg-success text-white">RESOLVED</span>;
      case "CLOSED":
        return <span className="badge bg-dark text-white">CLOSED</span>;
      case "CANCELLED":
        return <span className="badge bg-danger text-white">CANCELLED</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="badge bg-danger text-white">URGENT</span>;
      case "HIGH":
        return <span className="badge bg-warning text-dark">HIGH</span>;
      case "MEDIUM":
        return <span className="badge bg-info text-dark">MEDIUM</span>;
      case "LOW":
        return <span className="badge bg-secondary text-white">LOW</span>;
      default:
        return <span className="badge bg-light text-dark">{priority}</span>;
    }
  };

  const isFiltered =
    Boolean(search) ||
    Boolean(selectedCategory) ||
    Boolean(selectedPriority) ||
    Boolean(selectedStatus) ||
    Boolean(ownerFilter);

  // Forbidden state check (Role-Based Restriction)
  if (user && user.role === "REQUESTER") {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm border-0 p-4 rounded-4" role="alert">
          <div className="d-flex align-items-center gap-3">
            <span className="fs-1">🚫</span>
            <div>
              <h4 className="fw-bold mb-1">Access Denied (403 Forbidden)</h4>
              <p className="mb-0 small text-secondary">
                You do not have sufficient permissions to access the IT Staff Ticket Queue. An IT Staff or Administrator role is required.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            📋 IT Staff Ticket Queue
            <span className="badge bg-success bg-opacity-10 text-success fs-7 rounded-pill ms-2">
              {totalItems} Total
            </span>
          </h1>
          <p className="text-muted small mb-0">
            Manage, claim, prioritize, sort, and resolve operational user support tickets.
          </p>
        </div>
      </div>

      {/* Server Error State */}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4 py-3" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span>⚠️</span>
            <span className="small fw-medium">{error}</span>
          </div>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={loadTickets}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="zen-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          {/* Live Search */}
          <div className="col-12 col-md-3">
            <label htmlFor="queue-search" className="form-label visually-hidden">Search Tickets</label>
            <input
              id="queue-search"
              type="text"
              className="form-control zen-form-control form-control-sm"
              placeholder="🔍 Search ticket #, summary, details..."
              value={search}
              aria-label="Search ticket number, summary, details"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-2">
            <select
              aria-label="Filter by Category"
              className="form-select zen-form-control form-select-sm"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-2">
            <select
              aria-label="Filter by Priority"
              className="form-select zen-form-control form-select-sm"
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              aria-label="Filter by Status"
              className="form-select zen-form-control form-select-sm"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="PENDING_CLIENT">PENDING CLIENT</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Owner Filter */}
          <div className="col-6 col-md-2">
            <select
              aria-label="Filter by Ownership"
              className="form-select zen-form-control form-select-sm"
              value={ownerFilter}
              onChange={(e) => {
                setOwnerFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Ownership</option>
              <option value="unassigned">⚠️ Unassigned</option>
              <option value="me">👤 Assigned to Me</option>
            </select>
          </div>

          {/* Clear Filters */}
          {isFiltered && (
            <div className="col-12 col-md-1 text-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100 text-nowrap"
                onClick={handleClearFilters}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Queue Content Container */}
      <div className="zen-card p-0 overflow-hidden">
        {/* Sort & Controls Bar */}
        <div className="p-3 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Sort By:</span>
            <select
              aria-label="Sort tickets by field"
              className="form-select zen-form-control form-select-sm text-truncate"
              style={{ maxWidth: 160 }}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Last Updated</option>
              <option value="ticketNumber">Ticket Number</option>
              <option value="itPriority">IT Priority</option>
              <option value="requestedPriority">Requested Priority</option>
              <option value="status">Status</option>
            </select>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-2"
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              title={`Toggle sort order (${sortOrder.toUpperCase()})`}
            >
              {sortOrder === "asc" ? "⬆️ ASC" : "⬇️ DESC"}
            </button>
          </div>

          {/* Page Size Selector */}
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Per Page:</span>
            <select
              aria-label="Page size selector"
              className="form-select zen-form-control form-select-sm"
              style={{ width: 75 }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-success spinner-border-sm mb-2" role="status" style={{ color: "#055037" }} />
            <div className="small">Loading ticket queue...</div>
          </div>
        ) : tickets.length === 0 ? (
          /* Empty / No-Results States */
          <div className="text-center py-5 px-3">
            {isFiltered ? (
              <div>
                <span className="fs-1 d-block mb-2">🔍</span>
                <h3 className="h6 fw-bold text-dark mb-1">No Tickets Found</h3>
                <p className="text-muted small mb-3">No tickets match your specified filter criteria.</p>
                <button type="button" className="btn zen-btn-primary btn-sm" onClick={handleClearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <span className="fs-1 d-block mb-2">📥</span>
                <h3 className="h6 fw-bold text-dark mb-1">Queue is Empty</h3>
                <p className="text-muted small mb-0">There are currently no tickets in the support queue.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table View (> 768px) */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSortClick("ticketNumber")}>
                      Ticket # {sortBy === "ticketNumber" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSortClick("createdAt")}>
                      Created Date {sortBy === "createdAt" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
                    </th>
                    <th>Summary</th>
                    <th>Category</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSortClick("requestedPriority")}>
                      Requested Priority
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSortClick("itPriority")}>
                      IT Priority {sortBy === "itPriority" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSortClick("status")}>
                      Status {sortBy === "status" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
                    </th>
                    <th>Ticket Owner</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSortClick("updatedAt")}>
                      Last Updated {sortBy === "updatedAt" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
                    </th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => onSelectTicket(ticket.id)}
                    >
                      {/* Ticket Number */}
                      <td className="fw-bold text-success font-monospace">{ticket.ticketNumber}</td>

                      {/* Created Date */}
                      <td className="small text-muted">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                        <div className="extra-small opacity-75">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* Summary */}
                      <td>
                        <div className="fw-semibold text-dark small text-truncate" style={{ maxWidth: 200 }}>
                          {ticket.summary}
                        </div>
                        <div className="text-muted extra-small">{ticket.requester?.name || `ID #${ticket.requesterId}`}</div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge bg-light text-dark border">
                          {ticket.category?.name || "General"}
                        </span>
                      </td>

                      {/* Requested Priority */}
                      <td>{getPriorityBadge(ticket.requestedPriority)}</td>

                      {/* IT Priority */}
                      <td>{getPriorityBadge(ticket.itPriority || ticket.requestedPriority)}</td>

                      {/* Status */}
                      <td>{getStatusBadge(ticket.status)}</td>

                      {/* Ticket Owner */}
                      <td>
                        {ticket.owner ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle">
                            👤 {ticket.owner.name}
                          </span>
                        ) : (
                          <span className="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning-subtle">
                            ⚠️ Unassigned
                          </span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="small text-muted">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                        <div className="extra-small opacity-75">{new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* Actions */}
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex justify-content-end gap-1">
                          {!ticket.owner && (
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm text-nowrap"
                              disabled={claimingId === ticket.id}
                              onClick={(e) => handleClaim(ticket.id, e)}
                            >
                              {claimingId === ticket.id ? "Claiming..." : "⚡ Claim"}
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn zen-btn-primary btn-sm text-nowrap"
                            onClick={() => onSelectTicket(ticket.id)}
                          >
                            Open Ticket Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Zen Card List View (< 767px) */}
            <div className="d-block d-md-none p-3">
              <div className="d-flex flex-column gap-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 rounded-3 border bg-white shadow-sm"
                    onClick={() => onSelectTicket(ticket.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="fw-bold text-success font-monospace">{ticket.ticketNumber}</span>
                      <div>{getStatusBadge(ticket.status)}</div>
                    </div>

                    <h2 className="h6 fw-bold text-dark mb-1">{ticket.summary}</h2>
                    <div className="text-muted extra-small mb-3">
                      Requester: <strong>{ticket.requester?.name || `ID #${ticket.requesterId}`}</strong>
                    </div>

                    <div className="row g-2 mb-3 bg-light p-2 rounded text-muted extra-small">
                      <div className="col-6">
                        <strong>Category:</strong> {ticket.category?.name || "General"}
                      </div>
                      <div className="col-6">
                        <strong>Owner:</strong>{" "}
                        {ticket.owner ? (
                          <span className="text-success fw-semibold">{ticket.owner.name}</span>
                        ) : (
                          <span className="text-warning-emphasis fw-semibold">Unassigned</span>
                        )}
                      </div>
                      <div className="col-6">
                        <strong>Req Priority:</strong> {ticket.requestedPriority}
                      </div>
                      <div className="col-6">
                        <strong>IT Priority:</strong> {ticket.itPriority || ticket.requestedPriority}
                      </div>
                      <div className="col-6">
                        <strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                      <div className="col-6">
                        <strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" onClick={(e) => e.stopPropagation()}>
                      {!ticket.owner ? (
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm py-1"
                          disabled={claimingId === ticket.id}
                          onClick={(e) => handleClaim(ticket.id, e)}
                        >
                          {claimingId === ticket.id ? "Claiming..." : "⚡ Claim Ticket"}
                        </button>
                      ) : (
                        <span className="text-muted extra-small">Assigned</span>
                      )}
                      <button
                        type="button"
                        className="btn zen-btn-primary btn-sm py-1"
                        onClick={() => onSelectTicket(ticket.id)}
                      >
                        Open Ticket Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pagination Footer */}
        <div className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 bg-white">
          <span className="text-muted small">
            Showing {totalItems === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalItems)} of {totalItems} total tickets
          </span>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="align-self-center small fw-semibold px-2">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
