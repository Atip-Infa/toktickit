import React, { useState, useEffect } from "react";
import {
  Ticket,
  User,
  fetchTicketDetail,
  updateStaffTicket,
  getAttachmentDownloadUrl,
  softRemoveAttachment,
  fetchAdminUsers,
} from "../api.js";
import { useAuth } from "../context/AuthContext.js";
import { PublicCommentsSection } from "./PublicCommentsSection.js";
import { InternalNotesSection } from "./InternalNotesSection.js";

interface StaffTicketDetailViewProps {
  ticketId: number;
  onBack: () => void;
}

export const StaffTicketDetailView: React.FC<StaffTicketDetailViewProps> = ({ ticketId, onBack }) => {
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string>("");

  // Form Edit State
  const [itPriority, setItPriority] = useState<string>("MEDIUM");
  const [status, setStatus] = useState<string>("NEW");
  const [ownerId, setOwnerId] = useState<string>("");
  const [resolutionSummary, setResolutionSummary] = useState<string>("");

  // Active Tab state for UI layout (Public Comments, Internal Notes, Attachments, Service Actions)
  const [activeTab, setActiveTab] = useState<"all" | "comments" | "notes" | "attachments" | "actions">("comments");

  // Attachment Removal Modal state
  const [removingAttachmentId, setRemovingAttachmentId] = useState<number | null>(null);
  const [removalReason, setRemovalReason] = useState<string>("");
  const [removalError, setRemovalError] = useState<string>("");

  const loadTicket = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTicketDetail(ticketId);
      setTicket(data);
      setItPriority(data.itPriority || data.requestedPriority || "MEDIUM");
      setStatus(data.status || "NEW");
      setOwnerId(data.owner ? String(data.owner.id) : "");
      setResolutionSummary(data.resolutionSummary || "");
    } catch (err: any) {
      setError(err?.message || "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  useEffect(() => {
    // Fetch list of IT staff users for reassign dropdown if admin/staff
    fetchAdminUsers({ role: "IT_STAFF", pageSize: 50 })
      .then((res) => setStaffUsers(res.data))
      .catch(() => {});
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSaveSuccess("");

    try {
      let ownerParam: string | number | null = null;
      if (ownerId === "claim") {
        ownerParam = "claim";
      } else if (ownerId) {
        ownerParam = Number(ownerId);
      } else {
        ownerParam = null;
      }

      const updated = await updateStaffTicket(ticketId, {
        itPriority,
        status,
        ownerId: ownerParam,
        resolutionSummary: status === "RESOLVED" || status === "CLOSED" ? resolutionSummary : undefined,
      });

      setTicket(updated);
      setSaveSuccess("Ticket workflow updated successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to update ticket");
    } finally {
      setSaving(false);
    }
  };

  const handleClaimQuick = async () => {
    if (!user || saving) return;
    setOwnerId(String(user.id));
    if (status === "NEW") {
      setStatus("IN_PROGRESS");
    }
  };

  const handleSoftRemove = async () => {
    if (!removingAttachmentId || removalReason.trim().length < 3) {
      setRemovalError("Removal reason is required (min 3 characters).");
      return;
    }

    try {
      await softRemoveAttachment(removingAttachmentId, removalReason.trim());
      setRemovingAttachmentId(null);
      setRemovalReason("");
      setRemovalError("");
      loadTicket();
    } catch (err: any) {
      setRemovalError(err?.message || "Failed to remove attachment.");
    }
  };

  const getAllowedStatuses = (currentStatus: string) => {
    const map: Record<string, string[]> = {
      NEW: ["NEW", "OPEN", "ASSIGNED", "IN_PROGRESS", "CANCELLED"],
      OPEN: ["OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "PENDING_CLIENT", "CANCELLED"],
      ASSIGNED: ["ASSIGNED", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "PENDING_CLIENT", "CANCELLED"],
      IN_PROGRESS: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "PENDING_CLIENT", "RESOLVED", "CANCELLED"],
      WAITING_FOR_REQUESTER: ["WAITING_FOR_REQUESTER", "PENDING_CLIENT", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
      PENDING_CLIENT: ["PENDING_CLIENT", "WAITING_FOR_REQUESTER", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
      RESOLVED: ["RESOLVED", "CLOSED", "REOPENED"],
      CLOSED: ["CLOSED", "REOPENED"],
      REOPENED: ["REOPENED", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "PENDING_CLIENT", "RESOLVED"],
      CANCELLED: ["CANCELLED"],
    };
    return map[currentStatus] || [currentStatus];
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
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
        return <span className="badge bg-light text-dark">{s}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-success spinner-border-sm mb-2" role="status" />
        <div>Loading ticket details...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container py-5">
        <button className="btn zen-btn-secondary btn-sm mb-3" onClick={onBack}>
          ← Back to Queue
        </button>
        <div className="alert alert-danger">Ticket not found or access denied.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Back Button */}
      <button className="btn zen-btn-secondary btn-sm mb-3" onClick={onBack}>
        ← Back to Ticket Queue
      </button>

      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
      {saveSuccess && <div className="alert alert-success py-2 small mb-3">{saveSuccess}</div>}

      <div className="row g-4">
        {/* Main Content Area */}
        <div className="col-12 col-lg-8">
          {/* Header Card */}
          <div className="zen-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="badge bg-light text-success font-monospace fs-6 border">
                {ticket.ticketNumber}
              </span>
              <div>{getStatusBadge(ticket.status)}</div>
            </div>

            <h1 className="h4 fw-bold mb-3">{ticket.summary}</h1>

            <div className="p-3 bg-light rounded border mb-4">
              <h2 className="h6 fw-bold text-muted mb-2">Description</h2>
              <p className="mb-0 small text-secondary style-whitespace">{ticket.description}</p>
            </div>

            {/* Resolution Summary (If resolved/closed) */}
            {ticket.resolutionSummary && (
              <div className="p-3 bg-success-subtle border border-success-subtle rounded mb-4">
                <h2 className="h6 fw-bold text-success-emphasis mb-1">✅ Resolution Summary</h2>
                <p className="mb-0 small text-success-emphasis">{ticket.resolutionSummary}</p>
              </div>
            )}

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <h2 className="h6 fw-bold mb-2">📎 Attachments ({ticket.attachments.length})</h2>
                <div className="d-flex flex-column gap-2">
                  {ticket.attachments.map((att) => (
                    <div
                      key={att.id}
                      className={`p-2 rounded border d-flex justify-content-between align-items-center ${
                        att.isRemoved ? "bg-light text-muted" : "bg-white"
                      }`}
                    >
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <span className="small text-truncate fw-semibold">{att.filename}</span>
                        <span className="text-muted extra-small">
                          ({(att.fileSize / 1024).toFixed(1)} KB)
                        </span>
                        {att.isRemoved && (
                          <span className="badge bg-danger text-white extra-small">Removed</span>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        {!att.isRemoved && (
                          <>
                            <a
                              href={getAttachmentDownloadUrl(att.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-secondary btn-sm py-0 text-decoration-none"
                            >
                              Download
                            </a>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-0"
                              onClick={() => {
                                setRemovingAttachmentId(att.id);
                                setRemovalReason("");
                                setRemovalError("");
                              }}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab Header Bar (Identical to Handout Screenshot) */}
          <div className="bg-light p-2 rounded-top border-top border-start border-end d-flex gap-2 flex-wrap mb-0">
            <button
              type="button"
              className={`btn btn-sm fw-semibold rounded-3 d-flex align-items-center gap-1 ${
                activeTab === "comments" ? "btn-success text-white" : "btn-outline-secondary bg-white"
              }`}
              onClick={() => setActiveTab("comments")}
            >
              <span>💬 Public Comments</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-semibold rounded-3 d-flex align-items-center gap-1 ${
                activeTab === "notes" ? "btn-success text-white" : "btn-outline-secondary bg-white"
              }`}
              onClick={() => setActiveTab("notes")}
            >
              <span>📝 Internal Notes</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-semibold rounded-3 d-flex align-items-center gap-1 ${
                activeTab === "attachments" ? "btn-success text-white" : "btn-outline-secondary bg-white"
              }`}
              onClick={() => setActiveTab("attachments")}
            >
              <span>📎 Attachments ({ticket.attachments?.length || 0})</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-semibold rounded-3 d-flex align-items-center gap-1 ${
                activeTab === "actions" ? "btn-success text-white" : "btn-outline-secondary bg-white"
              }`}
              onClick={() => setActiveTab("actions")}
            >
              <span>🛠️ Service Actions</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-semibold rounded-3 ms-auto ${
                activeTab === "all" ? "btn-dark text-white" : "btn-outline-dark"
              }`}
              onClick={() => setActiveTab("all")}
            >
              👁️ View All
            </button>
          </div>

          {/* Tab Content Display */}
          {(activeTab === "comments" || activeTab === "all") && (
            <PublicCommentsSection ticketId={ticket.id} />
          )}

          {(activeTab === "notes" || activeTab === "all") && (
            <InternalNotesSection ticketId={ticket.id} />
          )}

          {(activeTab === "attachments" || activeTab === "all") && (
            <div className="card shadow-sm border mb-4">
              <div className="card-header bg-light py-3">
                <h3 className="h6 mb-0 fw-bold d-flex align-items-center gap-2">
                  📎 Attachments ({ticket.attachments?.length || 0})
                </h3>
              </div>
              <div className="card-body">
                {!ticket.attachments || ticket.attachments.length === 0 ? (
                  <div className="text-center py-3 text-muted small fst-italic">
                    No attachments uploaded for this ticket.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {ticket.attachments.map((att) => (
                      <div
                        key={att.id}
                        className={`p-3 rounded border d-flex justify-content-between align-items-center ${
                          att.isRemoved ? "bg-light text-muted" : "bg-white"
                        }`}
                      >
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <strong className="small text-dark">{att.filename}</strong>
                            <span className="text-muted extra-small">
                              ({(att.fileSize / 1024).toFixed(1)} KB)
                            </span>
                            {att.isRemoved && (
                              <span className="badge bg-danger text-white extra-small">
                                Soft Removed
                              </span>
                            )}
                          </div>
                          {att.isRemoved && att.removalReason && (
                            <div className="text-danger extra-small fst-italic">
                              Reason: {att.removalReason}
                            </div>
                          )}
                        </div>

                        <div className="d-flex gap-2">
                          {!att.isRemoved && (
                            <>
                              <a
                                href={getAttachmentDownloadUrl(att.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-secondary btn-sm text-decoration-none"
                              >
                                Download
                              </a>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  setRemovingAttachmentId(att.id);
                                  setRemovalReason("");
                                  setRemovalError("");
                                }}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls Area */}
        <div className="col-12 col-lg-4">
          {/* Workflow & Assignment Control Panel */}
          <div className="zen-card p-4 mb-4">
            <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
              ⚙️ Staff Controls & Workflow
            </h2>

            <form onSubmit={handleSaveChanges}>
              {/* IT Priority */}
              <div className="mb-3">
                <label className="form-label fw-semibold small mb-1">IT Priority</label>
                <select
                  className="form-select zen-form-control form-select-sm"
                  value={itPriority}
                  onChange={(e) => setItPriority(e.target.value)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
                <div className="text-muted extra-small mt-1">
                  Requested Priority: <strong>{ticket.requestedPriority}</strong>
                </div>
              </div>

              {/* Status Transition */}
              <div className="mb-3">
                <label className="form-label fw-semibold small mb-1">Ticket Status</label>
                <select
                  className="form-select zen-form-control form-select-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {getAllowedStatuses(ticket.status).map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Owner Assignment */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold small mb-0">Assigned IT Staff</label>
                  {user && ownerId !== String(user.id) && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-success text-decoration-none extra-small fw-semibold"
                      onClick={handleClaimQuick}
                    >
                      ⚡ Claim to Me
                    </button>
                  )}
                </div>
                <select
                  className="form-select zen-form-control form-select-sm"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {user && <option value={String(user.id)}>Assign to Me ({user.name})</option>}
                  {staffUsers
                    .filter((u) => u.id !== user?.id)
                    .map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                </select>
              </div>

              {/* Resolution Summary (Required when Resolving) */}
              {(status === "RESOLVED" || status === "CLOSED") && (
                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Resolution Summary</label>
                  <textarea
                    className="form-control zen-form-control form-control-sm"
                    rows={3}
                    placeholder="Describe how the problem was resolved..."
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn zen-btn-primary w-100 btn-sm fw-semibold"
                disabled={saving}
              >
                {saving ? "Saving Workflow..." : "💾 Update Workflow"}
              </button>
            </form>
          </div>

          {/* Requester Context Details */}
          <div className="zen-card p-4">
            <h2 className="h6 fw-bold mb-3">👤 Requester Information</h2>
            <div className="mb-2">
              <div className="text-muted extra-small">Name</div>
              <div className="fw-semibold small">{ticket.requester?.name || "N/A"}</div>
            </div>
            <div className="mb-2">
              <div className="text-muted extra-small">Email</div>
              <div className="small text-dark">{ticket.requester?.email || "N/A"}</div>
            </div>
            <div className="mb-2">
              <div className="text-muted extra-small">Department</div>
              <div className="small text-dark">{ticket.requester?.department || "General"}</div>
            </div>
            <div className="mb-2">
              <div className="text-muted extra-small">Category</div>
              <div className="small text-dark">{ticket.category?.name}</div>
            </div>
            <div>
              <div className="text-muted extra-small">Related System</div>
              <div className="small text-dark">{ticket.relatedSystem?.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Soft Removal Modal */}
      {removingAttachmentId && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content zen-card border-0 p-4">
              <h2 className="h5 fw-bold mb-2">Remove Attachment</h2>
              <p className="text-muted small mb-3">
                Specify a reason for soft-removing this attachment.
              </p>

              {removalError && <div className="alert alert-danger py-2 small mb-2">{removalError}</div>}

              <textarea
                className="form-control zen-form-control mb-3"
                rows={3}
                placeholder="Reason for removal (min 3 characters)..."
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
              />

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn zen-btn-secondary btn-sm"
                  onClick={() => setRemovingAttachmentId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleSoftRemove}
                >
                  Confirm Removal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
