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
  const [ownerFilter, setOwnerFilter] = useState<string>(""); // "", "unassigned", or userId
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Claiming state track
  const [claimingId, setClaimingId] = useState<number | null>(null);

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
        pageSize: 10,
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
    loadTickets();
  }, [search, selectedCategory, selectedPriority, selectedStatus, ownerFilter, sortBy, sortOrder, page]);

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

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            📋 IT Staff Ticket Queue
          </h1>
          <p className="text-muted small mb-0">
            Manage, claim, prioritize, and resolve all incoming user IT support tickets.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

      {/* Filter and Search Toolbar */}
      <div className="zen-card p-3 mb-4">
        <div className="row g-2">
          {/* Search */}
          <div className="col-12 col-md-4">
            <input
              type="text"
              className="form-control zen-form-control form-control-sm"
              placeholder="🔍 Search ticket #, summary, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-2">
            <select
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
              className="form-select zen-form-control form-select-sm"
              value={ownerFilter}
              onChange={(e) => {
                setOwnerFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Ownership</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">Assigned to Me</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="zen-card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-success spinner-border-sm mb-2" role="status" />
            <div>Loading ticket queue...</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="mb-0 fw-semibold">No tickets match the selected criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ticket #</th>
                  <th>Requester</th>
                  <th>Summary</th>
                  <th>Category</th>
                  <th>IT Priority</th>
                  <th>Status</th>
                  <th>Assigned Owner</th>
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
                    <td className="fw-bold text-success font-monospace">{ticket.ticketNumber}</td>
                    <td>
                      <div className="fw-semibold small">{ticket.requester?.name || `ID #${ticket.requesterId}`}</div>
                      <div className="text-muted extra-small">{ticket.requester?.department || ticket.requester?.email}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark small text-truncate" style={{ maxWidth: 220 }}>
                        {ticket.summary}
                      </div>
                      <div className="text-muted extra-small">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {ticket.category?.name || "General"}
                      </span>
                    </td>
                    <td>{getPriorityBadge(ticket.itPriority || ticket.requestedPriority)}</td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>
                      {ticket.owner ? (
                        <span className="small fw-semibold text-dark">
                          👤 {ticket.owner.name}
                        </span>
                      ) : (
                        <span className="text-muted small fst-italic">Unassigned</span>
                      )}
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex justify-content-end gap-2">
                        {!ticket.owner && (
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            disabled={claimingId === ticket.id}
                            onClick={(e) => handleClaim(ticket.id, e)}
                          >
                            {claimingId === ticket.id ? "Claiming..." : "⚡ Claim"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn zen-btn-primary btn-sm"
                          onClick={() => onSelectTicket(ticket.id)}
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-white">
          <span className="text-muted small">
            Showing {tickets.length} of {totalItems} total tickets
          </span>
          <div className="d-flex gap-2">
            <button
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
