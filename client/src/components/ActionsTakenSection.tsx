import React, { useState, useEffect } from "react";
import {
  ActionTaken,
  fetchActionsTaken,
  createActionTaken,
  updateActionTaken,
} from "../api.js";
import { useAuth } from "../context/AuthContext.js";

interface ActionsTakenSectionProps {
  ticketId: number;
  onActionsUpdated?: () => void;
}

export const ActionsTakenSection: React.FC<ActionsTakenSectionProps> = ({
  ticketId,
  onActionsUpdated,
}) => {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === "IT_STAFF" || user?.role === "ADMINISTRATOR";

  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Modal State (Create or Edit)
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAction, setEditingAction] = useState<ActionTaken | null>(null);

  // Form State
  const [description, setDescription] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [followUpRequired, setFollowUpRequired] = useState<boolean>(false);
  const [followUpNote, setFollowUpNote] = useState<string>("");
  const [attachmentNotes, setAttachmentNotes] = useState<string>("");

  // Validation & Submission State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>("");

  // Detail Modal State (View full detail)
  const [viewingAction, setViewingAction] = useState<ActionTaken | null>(null);

  const loadActions = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError("");

    try {
      const data = await fetchActionsTaken(ticketId);
      setActions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load Actions Taken.");
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [ticketId]);

  const handleOpenCreateModal = () => {
    setEditingAction(null);
    setDescription("");
    setResult("");
    setFollowUpRequired(false);
    setFollowUpNote("");
    setAttachmentNotes("");
    setValidationErrors({});
    setModalError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (action: ActionTaken) => {
    setEditingAction(action);
    setDescription(action.description || "");
    setResult(action.result || "");
    setFollowUpRequired(action.followUpRequired || false);
    setFollowUpNote(action.followUpNote || "");
    setAttachmentNotes(action.attachmentNotes || "");
    setValidationErrors({});
    setModalError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAction(null);
    setValidationErrors({});
    setModalError("");
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!description.trim()) {
      errors.description = "Action description is required.";
    }

    if (!result.trim()) {
      errors.result = "Action result is required.";
    }

    if (followUpRequired && !followUpNote.trim()) {
      errors.followUpNote = "Follow-up note is required when follow-up is requested.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (submitting) return;

    setSubmitting(true);
    setModalError("");

    try {
      if (editingAction) {
        // Edit Action Taken
        await updateActionTaken(ticketId, editingAction.id, {
          description: description.trim(),
          result: result.trim(),
          followUpRequired,
          followUpNote: followUpRequired ? followUpNote.trim() : undefined,
          attachmentNotes: attachmentNotes.trim() || undefined,
          expectedUpdatedAt: editingAction.updatedAt,
        });
      } else {
        // Create Action Taken
        await createActionTaken(ticketId, {
          description: description.trim(),
          result: result.trim(),
          followUpRequired,
          followUpNote: followUpRequired ? followUpNote.trim() : undefined,
          attachmentNotes: attachmentNotes.trim() || undefined,
        });
      }

      handleCloseModal();
      await loadActions();
      if (onActionsUpdated) {
        onActionsUpdated();
      }
    } catch (err: any) {
      setModalError(err?.message || "Failed to save Action Taken.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--zg-surface, #ffffff)",
        borderRadius: "8px",
        border: "1px solid var(--zg-border, #e2e8f0)",
        padding: "20px",
        marginTop: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
      data-testid="actions-taken-section"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--zg-text, #1e293b)",
            }}
          >
            Actions Taken
          </h3>
          <span
            style={{
              backgroundColor: "var(--zg-bg, #f1f5f9)",
              color: "var(--zg-muted, #64748b)",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
            data-testid="actions-count-badge"
          >
            {actions.length}
          </span>
        </div>

        {/* Staff & Admin Create Action Button */}
        {isStaffOrAdmin && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              backgroundColor: "var(--zg-primary, #055037)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background-color 0.2s ease",
            }}
            data-testid="add-action-taken-btn"
          >

            <span>+ Add Action Taken</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "6px",
            fontSize: "0.875rem",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          data-testid="actions-error-alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadActions}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#991b1b",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: "var(--zg-muted, #64748b)",
            fontSize: "0.9rem",
          }}
          data-testid="actions-loading"
        >
          Loading Actions Taken...
        </div>
      ) : actions.length === 0 ? (
        /* Empty State */
        <div
          style={{
            padding: "32px 16px",
            textAlign: "center",
            backgroundColor: "var(--zg-bg, #f8fafc)",
            borderRadius: "6px",
            border: "1px dashed var(--zg-border, #cbd5e1)",
            color: "var(--zg-muted, #64748b)",
          }}
          data-testid="actions-empty-state"
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>📋</div>
          <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "var(--zg-text, #1e293b)" }}>
            No Actions Taken Recorded
          </p>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>
            {isStaffOrAdmin
              ? "Record work performed under this ticket to keep track of resolutions."
              : "No operational actions recorded yet by IT Staff."}
          </p>
        </div>
      ) : (
        /* Actions List / Cards */
        <div
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          data-testid="actions-list"
        >
          {actions.map((action) => (
            <div
              key={action.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid var(--zg-border, #e2e8f0)",
                borderRadius: "6px",
                padding: "16px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
              data-testid={`action-card-${action.id}`}
            >
              {/* Card Header Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--zg-muted, #64748b)",
                      marginBottom: "2px",
                    }}
                    data-testid="action-date-performer"
                  >
                    <span style={{ fontWeight: 600, color: "var(--zg-text, #1e293b)" }}>
                      {action.performedBy?.name || "IT Staff"}
                    </span>{" "}
                    <span
                      style={{
                        backgroundColor: "#e0e7ff",
                        color: "#3730a3",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        marginLeft: "4px",
                      }}
                    >
                      {action.performedBy?.role || "IT_STAFF"}
                    </span>{" "}
                    • {formatDate(action.actionDate || action.createdAt)}
                  </div>
                </div>

                {/* Right Badges & Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {action.followUpRequired ? (
                    <span
                      style={{
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fcd34d",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      data-testid="followup-badge-yes"
                    >
                      <span>⚠️</span> Follow-Up Needed
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: "#f1f5f9",
                        color: "#64748b",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                      data-testid="followup-badge-no"
                    >
                      No Follow-Up
                    </span>
                  )}

                  {/* Edit Button (Staff / Admin Only) */}
                  {isStaffOrAdmin && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(action)}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid var(--zg-border, #cbd5e1)",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--zg-text, #1e293b)",
                        cursor: "pointer",
                      }}
                      data-testid={`edit-action-btn-${action.id}`}
                    >
                      Edit
                    </button>
                  )}

                  {/* View Full Detail Button */}
                  <button
                    type="button"
                    onClick={() => setViewingAction(action)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid var(--zg-border, #cbd5e1)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--zg-primary, #055037)",
                      cursor: "pointer",
                    }}
                    data-testid={`view-action-btn-${action.id}`}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "8px" }}>
                <strong
                  style={{
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    color: "var(--zg-muted, #64748b)",
                    display: "block",
                    marginBottom: "2px",
                  }}
                >
                  Action Description:
                </strong>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--zg-text, #1e293b)",
                    whiteSpace: "pre-wrap",
                  }}
                  data-testid="action-description"
                >
                  {action.description}
                </div>
              </div>

              {/* Result */}
              <div style={{ marginBottom: action.followUpRequired || action.attachmentNotes ? "10px" : "0" }}>
                <strong
                  style={{
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    color: "var(--zg-muted, #64748b)",
                    display: "block",
                    marginBottom: "2px",
                  }}
                >
                  Result:
                </strong>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--zg-text, #1e293b)",
                    whiteSpace: "pre-wrap",
                  }}
                  data-testid="action-result"
                >
                  {action.result}
                </div>
              </div>

              {/* Follow-up Note Callout Box */}
              {action.followUpRequired && action.followUpNote && (
                <div
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#fffbeb",
                    borderLeft: "4px solid #f59e0b",
                    padding: "10px 12px",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    color: "#78350f",
                  }}
                  data-testid="action-followup-note-box"
                >
                  <strong>Follow-Up Note: </strong>
                  {action.followUpNote}
                </div>
              )}

              {/* Attachment Notes Callout Box */}
              {action.attachmentNotes && (
                <div
                  style={{
                    marginTop: "8px",
                    backgroundColor: "#f0fdf4",
                    borderLeft: "4px solid #16a34a",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    color: "#14532d",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  data-testid="action-attachment-notes-box"
                >
                  <span>📎</span>
                  <span>
                    <strong>Attachment Notes: </strong>
                    {action.attachmentNotes}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT ACTION TAKEN MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          data-testid="action-modal-overlay"
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              padding: "24px",
            }}
            data-testid="action-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-modal-title"
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid var(--zg-border, #e2e8f0)",
                paddingBottom: "12px",
              }}
            >
              <h3 id="action-modal-title" style={{ margin: 0, fontSize: "1.2rem", color: "var(--zg-text, #1e293b)" }}>
                {editingAction ? "Edit Action Taken" : "Add Action Taken"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close modal"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "var(--zg-muted, #64748b)",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Error Alert */}
            {modalError && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                }}
                data-testid="modal-error-alert"
              >
                {modalError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              {/* Performer read-only field */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "4px",
                    color: "var(--zg-text, #1e293b)",
                  }}
                >
                  Performed By (Auto-assigned)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${user?.name || "Authenticated User"} (${user?.role || "IT_STAFF"})`}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "var(--zg-bg, #f1f5f9)",
                    border: "1px solid var(--zg-border, #cbd5e1)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    color: "var(--zg-muted, #64748b)",
                    boxSizing: "border-box",
                  }}
                  data-testid="action-performer-input"
                />
              </div>

              {/* Action Description */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "4px",
                    color: "var(--zg-text, #1e293b)",
                  }}
                >
                  Action Description <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the specific work or diagnostic action taken..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: validationErrors.description
                      ? "1px solid #dc2626"
                      : "1px solid var(--zg-border, #cbd5e1)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  data-testid="action-description-textarea"
                />
                {validationErrors.description && (
                  <span
                    style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "2px", display: "block" }}
                    data-testid="description-error"
                  >
                    {validationErrors.description}
                  </span>
                )}
              </div>

              {/* Action Result */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "4px",
                    color: "var(--zg-text, #1e293b)",
                  }}
                >
                  Result / Outcome <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  rows={2}
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="Outcome or measurement result of this action..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: validationErrors.result
                      ? "1px solid #dc2626"
                      : "1px solid var(--zg-border, #cbd5e1)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  data-testid="action-result-textarea"
                />
                {validationErrors.result && (
                  <span
                    style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "2px", display: "block" }}
                    data-testid="result-error"
                  >
                    {validationErrors.result}
                  </span>
                )}
              </div>

              {/* Follow-Up Required Checkbox */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--zg-text, #1e293b)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    data-testid="followup-required-checkbox"
                  />
                  <span>Follow-Up Required?</span>
                </label>
              </div>

              {/* Follow-Up Note (Conditionally rendered when Follow-Up Required is true) */}
              {followUpRequired && (
                <div
                  style={{
                    marginBottom: "16px",
                    backgroundColor: "#fffbeb",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #fcd34d",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "4px",
                      color: "#78350f",
                    }}
                  >
                    Follow-Up Note <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="Specify follow-up instructions, timeline, or conditions..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: validationErrors.followUpNote
                        ? "1px solid #dc2626"
                        : "1px solid #fcd34d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                    data-testid="followup-note-textarea"
                  />
                  {validationErrors.followUpNote && (
                    <span
                      style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "2px", display: "block" }}
                      data-testid="followup-note-error"
                    >
                      {validationErrors.followUpNote}
                    </span>
                  )}
                </div>
              )}

              {/* Attachment Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "4px",
                    color: "var(--zg-text, #1e293b)",
                  }}
                >
                  Attachment Notes (Optional)
                </label>
                <input
                  type="text"
                  value={attachmentNotes}
                  onChange={(e) => setAttachmentNotes(e.target.value)}
                  placeholder="Notes describing referenced screenshots, diagnostic files, etc."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--zg-border, #cbd5e1)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  data-testid="attachment-notes-input"
                />
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  borderTop: "1px solid var(--zg-border, #e2e8f0)",
                  paddingTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--zg-border, #cbd5e1)",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--zg-text, #1e293b)",
                    cursor: "pointer",
                  }}
                  data-testid="cancel-action-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: "var(--zg-primary, #055037)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                  }}
                  data-testid="save-action-btn"
                >
                  {submitting
                    ? "Saving..."
                    : editingAction
                    ? "Save Changes"
                    : "Create Action Taken"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ACTION TAKEN DETAILS MODAL */}
      {viewingAction && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          data-testid="view-action-modal-overlay"
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              padding: "24px",
            }}
            data-testid="view-action-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-action-modal-title"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                borderBottom: "1px solid var(--zg-border, #e2e8f0)",
                paddingBottom: "12px",
              }}
            >
              <h3 id="view-action-modal-title" style={{ margin: 0, fontSize: "1.1rem", color: "var(--zg-text, #1e293b)" }}>
                Action Taken Details
              </h3>
              <button
                type="button"
                onClick={() => setViewingAction(null)}
                aria-label="Close details modal"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "var(--zg-muted, #64748b)",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
              <div>
                <strong>Performed By: </strong>
                <span>
                  {viewingAction.performedBy?.name || "IT Staff"} (
                  {viewingAction.performedBy?.role || "IT_STAFF"})
                </span>
              </div>
              <div>
                <strong>Date / Time: </strong>
                <span>{formatDate(viewingAction.actionDate || viewingAction.createdAt)}</span>
              </div>
              <div>
                <strong>Description: </strong>
                <div style={{ marginTop: "4px", whiteSpace: "pre-wrap", color: "var(--zg-text, #1e293b)" }}>
                  {viewingAction.description}
                </div>
              </div>
              <div>
                <strong>Result: </strong>
                <div style={{ marginTop: "4px", whiteSpace: "pre-wrap", color: "var(--zg-text, #1e293b)" }}>
                  {viewingAction.result}
                </div>
              </div>
              <div>
                <strong>Follow-Up Needed: </strong>
                <span>{viewingAction.followUpRequired ? "Yes" : "No"}</span>
              </div>
              {viewingAction.followUpRequired && viewingAction.followUpNote && (
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    padding: "10px",
                    borderRadius: "6px",
                    borderLeft: "4px solid #f59e0b",
                    color: "#78350f",
                  }}
                >
                  <strong>Follow-Up Note: </strong>
                  {viewingAction.followUpNote}
                </div>
              )}
              {viewingAction.attachmentNotes && (
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    padding: "10px",
                    borderRadius: "6px",
                    borderLeft: "4px solid #16a34a",
                    color: "#14532d",
                  }}
                >
                  <strong>Attachment Notes: </strong>
                  {viewingAction.attachmentNotes}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "flex-end",
                borderTop: "1px solid var(--zg-border, #e2e8f0)",
                paddingTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => setViewingAction(null)}
                style={{
                  backgroundColor: "var(--zg-primary, #055037)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                data-testid="close-view-modal-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
