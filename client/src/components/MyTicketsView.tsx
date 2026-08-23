import React, { useState, useEffect } from "react";
import {
  Ticket,
  Category,
  fetchMyTickets,
  fetchCategories,
} from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

interface MyTicketsViewProps {
  onCreateTicketClick?: () => void;
  onSelectTicket?: (ticketId: number) => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  onCreateTicketClick,
  onSelectTicket,
}) => {
  const { selectedRequester } = useRequester();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Filters & Query Params
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Load categories list for filter dropdown
  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch {
        // ignore fallback
      }
    }
    loadCats();
  }, []);

  // Fetch tickets whenever query parameters or requester context changes (BR-05, BR-06)
  const loadTickets = async () => {
    if (!selectedRequester) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetchMyTickets({
        requesterId: selectedRequester.id,
        search: searchTerm.trim(),
        category: selectedCategory,
        priority: selectedPriority,
        status: selectedStatus,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });

      setTickets(res.data);
      setTotalItems(res.meta.totalItems);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      setError(err?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [
    selectedRequester?.id,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTickets();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedPriority("");
    setSelectedStatus("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <span className="badge bg-primary">NEW</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-warning text-dark">IN PROGRESS</span>;
      case "PENDING":
        return <span className="badge bg-secondary">PENDING</span>;
      case "RESOLVED":
        return <span className="badge bg-success">RESOLVED</span>;
      case "CLOSED":
        return <span className="badge bg-dark">CLOSED</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="badge bg-danger">URGENT</span>;
      case "HIGH":
        return <span className="badge bg-warning text-dark">HIGH</span>;
      case "MEDIUM":
        return <span className="badge bg-info text-dark">MEDIUM</span>;
      case "LOW":
        return <span className="badge bg-light text-dark border">LOW</span>;
      default:
        return <span className="badge bg-secondary">{priority}</span>;
    }
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedCategory) ||
    Boolean(selectedPriority) ||
    Boolean(selectedStatus);

  return (
    <div className="container py-4">
      {/* Header & Main Action Bar */}
      <div className="zen-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <h1 className="h4 fw-bold mb-1">My Tickets</h1>
            <p className="text-muted small mb-0">
              View and track all support requests submitted by {selectedRequester?.name}.
            </p>
          </div>
          {onCreateTicketClick && (
            <button className="btn zen-btn-primary flex-shrink-0" onClick={onCreateTicketClick}>
              ➕ Create Ticket
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <input
                type="text"
                className="form-control zen-form-control"
                placeholder="Search by ticket no. or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn zen-btn-secondary" type="submit">
                🔍
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm zen-form-control"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm zen-form-control"
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm zen-form-control"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="col-6 col-md-2 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-sm zen-btn-secondary w-100"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters && sortBy === "createdAt"}
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Main Content Area (Table vs Cards vs States) */}
      {error ? (
        <div className="zen-card p-4 text-center text-danger" role="alert">
          <div className="fw-bold mb-2">Error Loading Tickets</div>
          <div className="small mb-3">{error}</div>
          <button className="btn btn-sm btn-outline-danger" onClick={loadTickets}>
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="zen-card p-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading tickets...</span>
          </div>
          <p className="small text-muted mt-2">Loading your support tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="zen-card p-5 text-center">
          {hasActiveFilters ? (
            <div>
              <div className="h5 fw-bold text-dark mb-2">No matching tickets found</div>
              <p className="text-muted small mb-3">
                No tickets match your filter criteria. Try clearing filters or adjusting your search term.
              </p>
              <button className="btn btn-sm zen-btn-secondary" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div>
              <div className="h5 fw-bold text-dark mb-2">No tickets submitted yet</div>
              <p className="text-muted small mb-3">
                You have not created any IT support tickets yet.
              </p>
              {onCreateTicketClick && (
                <button className="btn zen-btn-primary" onClick={onCreateTicketClick}>
                  ➕ Create First Ticket
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="zen-card overflow-hidden mb-4">
          {/* Desktop Data Table (Visible >= 768px) */}
          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted">
                <tr>
                  <th scope="col" style={{ cursor: "pointer" }} onClick={() => { setSortBy("ticketNumber"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                    Ticket No. {sortBy === "ticketNumber" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th scope="col" style={{ cursor: "pointer" }} onClick={() => { setSortBy("createdAt"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                    Created Date {sortBy === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th scope="col">Summary</th>
                  <th scope="col">Category</th>
                  <th scope="col">Req. Priority</th>
                  <th scope="col">IT Priority</th>
                  <th scope="col">Status</th>
                  <th scope="col">IT Owner</th>
                  <th scope="col">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} style={{ cursor: onSelectTicket ? "pointer" : "default" }} onClick={() => onSelectTicket && onSelectTicket(t.id)}>
                    <td className="fw-bold text-success small">{t.ticketNumber}</td>
                    <td className="small text-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="small fw-semibold">{t.summary}</td>
                    <td className="small">{t.category?.name || "N/A"}</td>
                    <td>{renderPriorityBadge(t.requestedPriority)}</td>
                    <td>{renderPriorityBadge(t.itPriority)}</td>
                    <td>{renderStatusBadge(t.status)}</td>
                    <td className="small text-muted">{t.itOwnerName || "Unassigned"}</td>
                    <td className="small text-muted">{new Date(t.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (Visible < 768px) */}
          <div className="d-block d-md-none p-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="border rounded p-3 mb-3 bg-white shadow-sm"
                onClick={() => onSelectTicket && onSelectTicket(t.id)}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-success">{t.ticketNumber}</span>
                  {renderStatusBadge(t.status)}
                </div>
                <div className="fw-semibold text-dark mb-2">{t.summary}</div>
                <div className="d-flex justify-content-between align-items-center extra-small text-muted">
                  <span>Category: {t.category?.name || "N/A"}</span>
                  <span>{renderPriorityBadge(t.requestedPriority)}</span>
                </div>
                <div className="extra-small text-muted mt-2 border-top pt-2">
                  Created: {new Date(t.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 bg-light border-top gap-3">
            <div className="d-flex align-items-center gap-3">
              <span className="small text-muted">
                Showing {tickets.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(page * pageSize, totalItems)} of {totalItems} tickets
              </span>
              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                &laquo; Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`btn btn-sm ${p === page ? "zen-btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
