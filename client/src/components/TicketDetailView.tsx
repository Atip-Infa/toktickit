import React, { useState, useEffect } from "react";
import {
  Ticket,
  Attachment,
  fetchTicketDetail,
  uploadAttachment,
  softRemoveAttachment,
  getAttachmentDownloadUrl,
} from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

interface TicketDetailViewProps {
  ticketId: number;
  onBack: () => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticketId,
  onBack,
}) => {
  const { selectedRequester } = useRequester();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Attachment upload state
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");

  // Soft-removal modal state
  const [removingAttachmentId, setRemovingAttachmentId] = useState<number | null>(null);
  const [removalReason, setRemovalReason] = useState<string>("");
  const [removalReasonError, setRemovalReasonError] = useState<string>("");
  const [removing, setRemoving] = useState<boolean>(false);

  const loadTicket = async () => {
    if (!selectedRequester || !ticketId) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchTicketDetail(ticketId, selectedRequester.id);
      setTicket(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load ticket detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [ticketId, selectedRequester?.id]);

  // Upload attachment trigger
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !ticket || !selectedRequester) return;

    const file = files[0];
    setUploadError("");

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5 MB limit.");
      e.target.value = "";
      return;
    }

    // Validate format
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExts.includes(ext)) {
      setUploadError("File type not supported. Allowed formats: JPG, PNG, WEBP, PDF.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      await uploadAttachment(ticket.id, file, selectedRequester.id);
      e.target.value = "";
      await loadTicket(); // Refresh ticket detail
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  };

  // Submit soft removal with reason (BR-15, BR-16, AC-08)
  const handleConfirmRemoval = async () => {
    if (!removingAttachmentId || !selectedRequester || !ticket) return;

    const trimmedReason = removalReason.trim();
    if (trimmedReason.length < 3) {
      setRemovalReasonError("Removal reason is required (minimum 3 characters).");
      return;
    }

    setRemoving(true);
    setRemovalReasonError("");

    try {
      await softRemoveAttachment(removingAttachmentId, trimmedReason, selectedRequester.id);
      setRemovingAttachmentId(null);
      setRemovalReason("");
      await loadTicket(); // Refresh ticket detail
    } catch (err: any) {
      setRemovalReasonError(err?.message || "Failed to remove attachment");
    } finally {
      setRemoving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="zen-card p-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading ticket details...</span>
          </div>
          <p className="small text-muted mt-2">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container py-4">
        <div className="zen-card p-4 text-center" role="alert">
          <div className="text-danger fw-bold mb-2">Access Denied or Ticket Not Found</div>
          <p className="text-muted small mb-3">{error || "Unable to view ticket."}</p>
          <button className="btn zen-btn-primary" onClick={onBack}>
            ← Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  const activeAttachments = ticket.attachments?.filter((a) => !a.isRemoved) || [];
  const isMaxAttachmentsReached = activeAttachments.length >= 5;

  return (
    <div className="container py-4" style={{ maxWidth: "920px" }}>
      {/* Back Navigation & Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
          ← Back to My Tickets
        </button>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Status:</span>
          {renderStatusBadge(ticket.status)}
        </div>
      </div>

      {/* Main Ticket Read-Only Detail Card */}
      <div className="zen-card p-4 p-md-5 mb-4">
        {/* Header Title Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start border-bottom pb-3 mb-4 gap-2">
          <div>
            <div className="text-success fw-bold small mb-1">{ticket.ticketNumber}</div>
            <h1 className="h4 fw-bold mb-1">{ticket.summary}</h1>
            <div className="text-muted small">
              Created on {new Date(ticket.createdAt).toLocaleString()} &bull; Last updated{" "}
              {new Date(ticket.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Metadata Fields Grid */}
        <div
          className="p-3 mb-4 rounded"
          style={{
            backgroundColor: "var(--color-field-readonly-bg)",
            border: "1px solid #E2E8F0",
          }}
        >
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-3">
              <span className="small text-muted d-block mb-1">Requester</span>
              <span className="fw-semibold small">{ticket.requester?.name || "N/A"}</span>
              <span className="text-muted extra-small d-block">{ticket.requester?.email}</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="small text-muted d-block mb-1">Category</span>
              <span className="fw-semibold small">{ticket.category?.name || "N/A"}</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="small text-muted d-block mb-1">Related System</span>
              <span className="fw-semibold small">{ticket.relatedSystem?.name || "N/A"}</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="small text-muted d-block mb-1">IT Ticket Owner</span>
              <span className="fw-semibold small">{ticket.itOwnerName || "Unassigned"}</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="small text-muted d-block mb-1">Requested Priority</span>
              {renderPriorityBadge(ticket.requestedPriority)}
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="small text-muted d-block mb-1">IT Priority</span>
              {renderPriorityBadge(ticket.itPriority)}
            </div>
          </div>
        </div>

        {/* Detailed Description Section */}
        <div className="mb-4">
          <h2 className="h6 fw-bold mb-2">Detailed Description</h2>
          <div
            className="p-3 rounded text-wrap"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              whiteSpace: "pre-wrap",
              minHeight: "100px",
            }}
          >
            {ticket.description}
          </div>
        </div>

        {/* Ticket Attachments Section */}
        <div className="border-top pt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h6 fw-bold mb-0">
              Ticket Attachments{" "}
              <span className="badge bg-secondary ms-1">
                {activeAttachments.length}/5 active
              </span>
            </h2>
          </div>

          {uploadError && (
            <div className="alert alert-danger small p-2 mb-3" role="alert">
              {uploadError}
            </div>
          )}

          {/* Add Attachment Trigger Form */}
          <div
            className="p-3 mb-4 rounded"
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px dashed #CBD5E1",
            }}
          >
            <label htmlFor="detailAttachmentInput" className="form-label fw-semibold small mb-1">
              Add Attachment to Ticket
            </label>
            <input
              id="detailAttachmentInput"
              type="file"
              className="form-control zen-form-control mb-2"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
              disabled={uploading || isMaxAttachmentsReached}
            />
            {isMaxAttachmentsReached ? (
              <div className="text-warning extra-small fw-semibold">
                Maximum limit of 5 active attachments reached for this ticket.
              </div>
            ) : (
              <div className="text-muted extra-small">
                Allowed formats: JPG, PNG, WEBP, PDF up to 5 MB each.
              </div>
            )}
            {uploading && (
              <div className="text-success extra-small mt-1">Uploading attachment...</div>
            )}
          </div>

          {/* Attachment List / Empty State */}
          {!ticket.attachments || ticket.attachments.length === 0 ? (
            <div className="text-muted small text-center py-3 bg-light rounded">
              No attachments uploaded for this ticket.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light extra-small text-muted">
                  <tr>
                    <th scope="col">File Name</th>
                    <th scope="col">Size</th>
                    <th scope="col">Upload Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.attachments.map((att) => (
                    <tr key={att.id}>
                      <td>
                        <span className={`small fw-semibold ${att.isRemoved ? "text-muted text-decoration-line-through" : ""}`}>
                          {att.filename}
                        </span>
                        {att.isRemoved && att.removalReason && (
                          <div className="text-danger extra-small">
                            Reason: "{att.removalReason}" (Removed on{" "}
                            {att.removedAt ? new Date(att.removedAt).toLocaleDateString() : "N/A"})
                          </div>
                        )}
                      </td>
                      <td className="small text-muted">{formatFileSize(att.fileSize)}</td>
                      <td className="small text-muted">{new Date(att.createdAt).toLocaleDateString()}</td>
                      <td>
                        {att.isRemoved ? (
                          <span className="badge bg-secondary">Removed</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                      <td className="text-end">
                        {att.isRemoved ? (
                          <span className="text-muted extra-small italic" style={{ fontSize: "0.75rem" }}>
                            Download restricted (Removed)
                          </span>
                        ) : (
                          <div className="d-flex justify-content-end gap-2">
                            <a
                              href={getAttachmentDownloadUrl(att.id, selectedRequester!.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-success py-0 px-2 extra-small"
                              style={{ fontSize: "0.75rem" }}
                            >
                              ⬇️ Download
                            </a>
                            <button
                              className="btn btn-sm btn-outline-danger py-0 px-2 extra-small"
                              style={{ fontSize: "0.75rem" }}
                              onClick={() => {
                                setRemovingAttachmentId(att.id);
                                setRemovalReason("");
                                setRemovalReasonError("");
                              }}
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Soft Removal Reason Modal / Card overlay */}
      {removingAttachmentId !== null && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="zen-card p-4" style={{ maxWidth: "460px", width: "90%" }}>
            <h3 className="h6 fw-bold mb-2">Remove Attachment</h3>
            <p className="text-muted small mb-3">
              Soft-removing this attachment retains its metadata record in database while disabling future downloads. A removal reason is required.
            </p>

            <div className="mb-3">
              <label htmlFor="removalReasonInput" className="form-label fw-semibold small mb-1">
                Removal Reason <span className="text-danger">*</span>
              </label>
              <textarea
                id="removalReasonInput"
                className={`form-control zen-form-control ${removalReasonError ? "is-invalid" : ""}`}
                rows={3}
                placeholder="Specify reason for removal (min 3 characters)..."
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
              />
              {removalReasonError && (
                <div className="invalid-feedback d-block small text-danger">
                  {removalReasonError}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-sm zen-btn-secondary"
                onClick={() => setRemovingAttachmentId(null)}
                disabled={removing}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={handleConfirmRemoval}
                disabled={removing}
              >
                {removing ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
