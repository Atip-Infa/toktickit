import React, { useState, useEffect } from "react";
import {
  Category,
  RelatedSystem,
  fetchCategories,
  fetchRelatedSystems,
  createTicket,
  uploadAttachment,
  Ticket,
} from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

interface CreateTicketFormProps {
  onSuccessViewMyTickets?: () => void;
  onCancel?: () => void;
}

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  onSuccessViewMyTickets,
  onCancel,
}) => {
  const { selectedRequester } = useRequester();

  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);

  // Form Fields
  const [categoryId, setCategoryId] = useState<string>("");
  const [relatedSystemId, setRelatedSystemId] = useState<string>("");
  const [requestedPriority, setRequestedPriority] = useState<string>("MEDIUM");
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);

  // UI States
  const [loadingRefData, setLoadingRefData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [attachmentError, setAttachmentError] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string>("");

  useEffect(() => {
    async function loadReferenceData() {
      setLoadingRefData(true);
      setApiError("");
      try {
        const [cats, systems] = await Promise.all([
          fetchCategories(),
          fetchRelatedSystems(),
        ]);
        setCategories(cats);
        setRelatedSystems(systems);
        if (cats.length > 0) setCategoryId(String(cats[0].id));
        if (systems.length > 0) setRelatedSystemId(String(systems[0].id));
      } catch (err: any) {
        setApiError(err?.message || "Failed to load reference data from server.");
      } finally {
        setLoadingRefData(false);
      }
    }
    loadReferenceData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (attachments.length + files.length > 5) {
      setAttachmentError("Maximum 5 active attachments allowed per ticket.");
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setAttachmentError("File type not supported. Allowed formats: JPG, PNG, WEBP, PDF");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setAttachmentError("File size exceeds 5 MB limit");
        return;
      }
      validFiles.push(file);
    }

    setAttachments((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!categoryId) errors.categoryId = "Category is required.";
    if (!relatedSystemId) errors.relatedSystemId = "Related System is required.";
    if (!summary.trim() || summary.trim().length < 5 || summary.trim().length > 120) {
      errors.summary = "Summary is required (min 5 characters, max 120 characters).";
    }
    if (!description.trim() || description.trim().length < 10 || description.trim().length > 2000) {
      errors.description = "Description is required (min 10 characters, max 2000 characters).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setApiError("");
    setUploadWarning("");

    if (!validateForm()) return;
    if (!selectedRequester) {
      setApiError("No active Development Requester selected.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Ticket record
      const ticket = await createTicket({
        requesterId: selectedRequester.id,
        categoryId: Number(categoryId),
        relatedSystemId: Number(relatedSystemId),
        requestedPriority,
        summary: summary.trim(),
        description: description.trim(),
      });

      // 2. Upload attachments if any selected
      if (attachments.length > 0) {
        const uploadResults = await Promise.allSettled(
          attachments.map((file) => uploadAttachment(ticket.id, file, selectedRequester.id))
        );

        const failedUploads = uploadResults.filter((r) => r.status === "rejected");
        if (failedUploads.length > 0) {
          setUploadWarning(
            `Ticket ${ticket.ticketNumber} created successfully, but ${failedUploads.length} attachment(s) failed to upload.`
          );
        }
      }

      setCreatedTicket(ticket);
    } catch (err: any) {
      // BR-11, AC-12: Form inputs are preserved in state on API error!
      setApiError(err?.message || "Failed to create ticket. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreatedTicket(null);
    setSummary("");
    setDescription("");
    setAttachments([]);
    setFormErrors({});
    setAttachmentError("");
    setApiError("");
    setUploadWarning("");
  };

  // Success State Render
  if (createdTicket) {
    return (
      <div className="container py-4 d-flex justify-content-center">
        <div className="zen-card p-4 p-md-5 w-100" style={{ maxWidth: 720 }}>
          <div className="text-center mb-4">
            <div className="zen-user-icon mb-3 text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                fill="currentColor"
                className="bi bi-check-circle-fill"
                viewBox="0 0 16 16"
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l4.992-5.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
            </div>
            <h2 className="h3 fw-bold text-success mb-2">Ticket Submitted Successfully!</h2>
            <p className="text-muted">
              Your support request has been logged into TokTickIT.
            </p>
          </div>

          <div className="p-4 rounded mb-4" style={{ backgroundColor: "var(--color-pale-green)", border: "1px solid #B8E2C8" }}>
            <div className="row g-3 text-center text-md-start align-items-center">
              <div className="col-md-6">
                <span className="text-muted small text-uppercase fw-semibold">Official Ticket Number</span>
                <div className="h3 fw-bold text-dark mb-0">{createdTicket.ticketNumber}</div>
              </div>
              <div className="col-md-6 text-md-end">
                <span className="badge bg-primary px-3 py-2 fs-6 mb-1">Status: {createdTicket.status}</span>
                <div className="small text-muted">Created Date: {new Date(createdTicket.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {uploadWarning && (
            <div className="alert alert-warning mb-4" role="alert">
              ⚠️ {uploadWarning}
            </div>
          )}

          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
            <button className="btn zen-btn-primary" onClick={resetForm}>
              ➕ Create Another Ticket
            </button>
            {onSuccessViewMyTickets && (
              <button className="btn zen-btn-secondary" onClick={onSuccessViewMyTickets}>
                📋 View My Tickets
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="zen-card p-4 p-md-5 mx-auto" style={{ maxWidth: 860 }}>
        {/* Header Title */}
        <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
          <div>
            <h1 className="h4 fw-bold mb-1">Create IT Support Ticket</h1>
            <p className="text-muted small mb-0">
              Submit a support request to the IT department for assistance.
            </p>
          </div>
          <span className="badge zen-badge-active">Requester Mode</span>
        </div>

        {/* Read-Only System Values Section */}
        <div className="p-3 mb-4 rounded" style={{ backgroundColor: "var(--color-field-readonly-bg)", border: "1px solid #E2E8F0" }}>
          <div className="row g-3">
            <div className="col-md-4">
              <span className="small text-muted d-block mb-1">Ticket Date</span>
              <span className="fw-semibold small">{new Date().toLocaleString()}</span>
            </div>
            <div className="col-md-4">
              <span className="small text-muted d-block mb-1">Requester Identity</span>
              <span className="fw-semibold small">{selectedRequester?.name || "N/A"}</span>
            </div>
            <div className="col-md-4">
              <span className="small text-muted d-block mb-1">Current Status</span>
              <span className="badge bg-info text-dark">NEW</span>
            </div>
          </div>
        </div>

        {apiError && (
          <div className="alert alert-danger mb-4" role="alert">
            <div className="fw-bold mb-1">Submission Failed</div>
            <div className="small">{apiError}</div>
          </div>
        )}

        {loadingRefData ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading categories and systems...</span>
            </div>
            <p className="small text-muted mt-2">Loading ticket categories and options...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Classification Fields */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="categorySelect" className="form-label fw-semibold small mb-1">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  id="categorySelect"
                  className={`form-select zen-form-control ${formErrors.categoryId ? "is-invalid" : ""}`}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && (
                  <div className="invalid-feedback d-block small text-danger">{formErrors.categoryId}</div>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="systemSelect" className="form-label fw-semibold small mb-1">
                  Related System <span className="text-danger">*</span>
                </label>
                <select
                  id="systemSelect"
                  className={`form-select zen-form-control ${formErrors.relatedSystemId ? "is-invalid" : ""}`}
                  value={relatedSystemId}
                  onChange={(e) => setRelatedSystemId(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  {relatedSystems.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.name}
                    </option>
                  ))}
                </select>
                {formErrors.relatedSystemId && (
                  <div className="invalid-feedback d-block small text-danger">{formErrors.relatedSystemId}</div>
                )}
              </div>
            </div>

            {/* Requested Priority */}
            <div className="mb-3">
              <label className="form-label fw-semibold small mb-1">Requested Priority</label>
              <div className="d-flex flex-wrap gap-2">
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`btn btn-sm ${
                      requestedPriority === p ? "zen-btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setRequestedPriority(p)}
                    disabled={isSubmitting}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Input */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="summaryInput" className="form-label fw-semibold small mb-0">
                  Ticket Summary <span className="text-danger">*</span>
                </label>
                <span className="text-muted extra-small" style={{ fontSize: "0.75rem" }}>
                  {summary.length} / 120
                </span>
              </div>
              <input
                id="summaryInput"
                type="text"
                className={`form-control zen-form-control ${formErrors.summary ? "is-invalid" : ""}`}
                placeholder="Brief summary of the issue (min 5 characters)"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={120}
                disabled={isSubmitting}
                required
              />
              {formErrors.summary && (
                <div className="invalid-feedback d-block small text-danger">{formErrors.summary}</div>
              )}
            </div>

            {/* Description Textarea */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="descriptionInput" className="form-label fw-semibold small mb-0">
                  Detailed Description <span className="text-danger">*</span>
                </label>
                <span className="text-muted extra-small" style={{ fontSize: "0.75rem" }}>
                  {description.length} / 2000
                </span>
              </div>
              <textarea
                id="descriptionInput"
                rows={5}
                className={`form-control zen-form-control ${formErrors.description ? "is-invalid" : ""}`}
                placeholder="Provide details about the problem, steps to reproduce, or error messages..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                disabled={isSubmitting}
                required
              />
              {formErrors.description && (
                <div className="invalid-feedback d-block small text-danger">{formErrors.description}</div>
              )}
            </div>

            {/* Attachments Section */}
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: "#F8FAFC", border: "1px dashed #CBD5E1" }}>
              <label htmlFor="attachmentInput" className="form-label fw-semibold small mb-1">
                Attachments (Optional, max 5 files, 5 MB per file)
              </label>
              <input
                id="attachmentInput"
                type="file"
                className="form-control zen-form-control mb-2"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                multiple
                disabled={isSubmitting || attachments.length >= 5}
              />
              <div className="text-muted extra-small mb-2" style={{ fontSize: "0.78rem" }}>
                Allowed formats: JPG, PNG, WEBP, PDF up to 5 MB each.
              </div>

              {attachmentError && (
                <div className="alert alert-danger py-2 small mb-2" role="alert">
                  {attachmentError}
                </div>
              )}

              {attachments.length > 0 && (
                <ul className="list-group list-group-flush border rounded bg-white mt-2">
                  {attachments.map((file, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small"
                    >
                      <span className="text-truncate me-2" style={{ maxWidth: 350 }}>
                        📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={() => removeAttachment(idx)}
                        disabled={isSubmitting}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Form Footer Action Buttons */}
            <div className="d-flex justify-content-end gap-3 pt-3 border-top">
              {onCancel && (
                <button
                  type="button"
                  className="btn zen-btn-secondary"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn zen-btn-primary d-flex align-items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Submitting Ticket...
                  </>
                ) : (
                  "Submit Ticket"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
