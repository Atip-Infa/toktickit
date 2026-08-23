import React, { useEffect, useState } from "react";
import { DevelopmentRequester, fetchActiveRequesters } from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

export const DevelopmentRequesterSelector: React.FC = () => {
  const { selectRequester } = useRequester();
  const [requesters, setRequesters] = useState<DevelopmentRequester[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadRequesters = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchActiveRequesters();
      setRequesters(data);
      if (data.length > 0) {
        setSelectedId(String(data[0].id));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load Development Requesters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequesters();
  }, []);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = requesters.find((r) => r.id === Number(selectedId));
    if (chosen) {
      selectRequester(chosen);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="zen-card p-4 p-md-5 w-100" style={{ maxWidth: 520 }}>
        {/* User Icon Circle */}
        <div className="zen-user-icon mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
          </svg>
        </div>

        <h2 className="h4 text-center fw-bold mb-2">Select Development Requester</h2>
        <p className="text-muted text-center small mb-4">
          Choose a development requester to simulate the current requester context for Lab 2.
          This is for testing only and is not a login screen.
        </p>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading Requesters...</span>
            </div>
            <p className="small text-muted mt-2">Loading active requesters...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger mb-4" role="alert">
            <div className="fw-bold mb-1">API Error</div>
            <div className="small">{error}</div>
            <button
              className="btn btn-sm btn-outline-danger mt-3"
              onClick={loadRequesters}
            >
              Retry Connection
            </button>
          </div>
        ) : requesters.length === 0 ? (
          <div className="alert alert-warning text-center my-3" role="alert">
            No active Development Requesters exist in the database.
          </div>
        ) : (
          <form onSubmit={handleContinue}>
            <div className="mb-3">
              <label htmlFor="requesterSelect" className="form-label fw-bold small mb-1">
                Development Requester <span className="text-danger">*</span>
              </label>
              <select
                id="requesterSelect"
                className="form-select zen-form-control"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
              >
                {requesters.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.name} ({req.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Explanatory Callout 1 */}
            <div className="zen-notice-banner d-flex align-items-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-info-circle flex-shrink-0 me-2 text-success"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>
              <span className="small">Only active development requesters are shown.</span>
            </div>

            {/* Explanatory Callout 2 */}
            <div className="p-3 bg-light border rounded mb-4">
              <div className="fw-bold small text-dark mb-1">Authentication coming in Lab 3</div>
              <div className="text-muted extra-small" style={{ fontSize: "0.82rem" }}>
                In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="submit"
                className="btn zen-btn-primary w-100"
                disabled={!selectedId}
              >
                Continue &rarr;
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
