import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";

export const ChangePasswordView: React.FC = () => {
  const { user, changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules check
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isMatch = newPassword && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError("New password does not meet all security requirements.");
      return;
    }
    if (!isMatch) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess("Password updated successfully! Redirecting...");
    } catch (err: any) {
      setError(err?.message || "Failed to update password. Please check your current password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="zg-change-password-container d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div className="zg-card p-4 shadow-sm rounded-4 bg-white" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="alert alert-warning d-flex align-items-start gap-2 mb-4 rounded-3" role="alert">
          <span className="fs-5">🔒</span>
          <div>
            <h6 className="alert-heading fw-bold mb-1">Mandatory Password Change</h6>
            <p className="mb-0 fs-7">
              Hello <strong>{user?.name}</strong>, you must change your initial password before accessing TokTickIT.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 fs-7 rounded-3" role="alert">
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3 fs-7 rounded-3" role="alert">
            <span>✅</span>
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="current-password" className="form-label fw-semibold fs-7 text-secondary">
              Current (Temporary) Password <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                className="form-control rounded-start-3"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary rounded-end-3"
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
              >
                {showCurrent ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="new-password" className="form-label fw-semibold fs-7 text-secondary">
              New Password <span className="text-danger">*</span>
            </label>
            <div className="input-group mb-2">
              <input
                id="new-password"
                type={showNew ? "text" : "password"}
                className="form-control rounded-start-3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary rounded-end-3"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                {showNew ? "👁️" : "🙈"}
              </button>
            </div>

            {/* Strength checklist */}
            <div className="p-3 bg-light rounded-3 fs-8 text-secondary border mb-3">
              <div className="fw-semibold mb-1">Password Requirements:</div>
              <div className={hasMinLength ? "text-success" : "text-muted"}>
                {hasMinLength ? "✓" : "○"} Minimum 8 characters
              </div>
              <div className={hasUppercase && hasLowercase ? "text-success" : "text-muted"}>
                {hasUppercase && hasLowercase ? "✓" : "○"} Uppercase & lowercase letters
              </div>
              <div className={hasNumber ? "text-success" : "text-muted"}>
                {hasNumber ? "✓" : "○"} At least one number
              </div>
              <div className={hasSpecial ? "text-success" : "text-muted"}>
                {hasSpecial ? "✓" : "○"} At least one special character
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="confirm-password" className="form-label fw-semibold fs-7 text-secondary">
              Confirm New Password <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                className="form-control rounded-start-3"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary rounded-end-3"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? "👁️" : "🙈"}
              </button>
            </div>
            {confirmPassword && !isMatch && (
              <div className="text-danger fs-8 mt-1">Passwords do not match</div>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary w-50 py-2 fw-semibold rounded-3"
              onClick={() => logout()}
              disabled={isSubmitting}
            >
              Sign Out
            </button>
            <button
              type="submit"
              className="btn btn-success w-50 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={isSubmitting || !isMatch || !hasMinLength}
              style={{ backgroundColor: "#055037", borderColor: "#055037" }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
