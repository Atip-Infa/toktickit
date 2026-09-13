import React, { useState, useEffect } from "react";
import { PublicComment, fetchPublicComments, postPublicComment } from "../api.js";

interface PublicCommentsSectionProps {
  ticketId: number;
}

export const PublicCommentsSection: React.FC<PublicCommentsSectionProps> = ({ ticketId }) => {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadComments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPublicComments(ticketId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load public comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadComments();
    }
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const created = await postPublicComment(ticketId, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch (err: any) {
      setError(err?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "IT_STAFF":
        return <span className="badge bg-primary text-white ms-2">IT Staff</span>;
      case "ADMINISTRATOR":
        return <span className="badge bg-danger text-white ms-2">Admin</span>;
      default:
        return <span className="badge bg-secondary text-white ms-2">Requester</span>;
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4 zen-card">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h3 className="h6 mb-0 fw-bold d-flex align-items-center gap-2">
          💬 Public Comments ({comments.length})
        </h3>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        {loading ? (
          <div className="text-center py-3 text-muted small">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-3 text-muted small fst-italic">
            No public comments yet. Add a comment below.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 rounded border bg-light">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center">
                    <strong className="small text-dark">{comment.author?.name || "User"}</strong>
                    {getRoleBadge(comment.author?.role || "REQUESTER")}
                  </div>
                  <span className="text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mb-0 small text-secondary style-whitespace">{comment.body || comment.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="pt-2 border-top">
          <label htmlFor={`comment-input-${ticketId}`} className="form-label fw-semibold small mb-1">Add Public Comment</label>
          <textarea
            id={`comment-input-${ticketId}`}
            className="form-control zen-form-control mb-2"
            rows={3}
            placeholder="Type your message here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn zen-btn-primary btn-sm d-flex align-items-center gap-2"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
