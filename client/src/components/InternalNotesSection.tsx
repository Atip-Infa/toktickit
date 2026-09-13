import React, { useState, useEffect } from "react";
import { InternalNote, fetchInternalNotes, postInternalNote } from "../api.js";

interface InternalNotesSectionProps {
  ticketId: number;
}

export const InternalNotesSection: React.FC<InternalNotesSectionProps> = ({ ticketId }) => {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInternalNotes(ticketId);
      setNotes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load internal notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadNotes();
    }
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const created = await postInternalNote(ticketId, newNote.trim());
      setNotes((prev) => [...prev, created]);
      setNewNote("");
    } catch (err: any) {
      setError(err?.message || "Failed to post internal note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="card shadow-sm border-warning mb-4"
      style={{ backgroundColor: "#FFFBEB", borderLeft: "4px solid #F59E0B" }}
    >
      <div className="card-header bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
        <h3 className="h6 mb-0 fw-bold text-warning-emphasis d-flex align-items-center gap-2">
          🔒 Internal Notes ({notes.length})
          <span className="badge bg-warning text-dark font-monospace extra-small ms-2">
            IT Staff Only
          </span>
        </h3>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        {loading ? (
          <div className="text-center py-3 text-muted small">Loading internal notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-3 text-muted small fst-italic">
            No internal notes yet. Internal notes are only visible to IT Staff and Administrators.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded border"
                style={{ backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center">
                    <strong className="small text-dark">{note.author?.name || "IT Staff"}</strong>
                    <span className="badge bg-warning text-dark ms-2">{note.author?.role}</span>
                  </div>
                  <span className="text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mb-0 small text-dark style-whitespace">{note.body || note.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="pt-2 border-top border-warning-subtle">
          <label htmlFor={`internal-note-input-${ticketId}`} className="form-label fw-semibold small mb-1 text-warning-emphasis">
            Add Internal Note (Not visible to Requesters)
          </label>
          <textarea
            id={`internal-note-input-${ticketId}`}
            className="form-control zen-form-control mb-2"
            rows={3}
            placeholder="Add investigation steps, diagnostic details, or internal staff notes..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={submitting}
          />
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-warning text-dark btn-sm fw-semibold d-flex align-items-center gap-2"
              disabled={submitting || !newNote.trim()}
            >
              {submitting ? "Saving..." : "🔒 Save Internal Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
