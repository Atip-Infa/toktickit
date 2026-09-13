import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="zg-login-container d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div className="zg-card zg-login-card p-4 shadow-sm rounded-4 bg-white" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center zg-logo-badge mb-2 p-2 rounded-circle bg-success bg-opacity-10 text-success fs-3">
            ⏱️
          </div>
          <h2 className="h4 fw-bold text-dark mb-1">TokTickIT</h2>
          <p className="text-muted small">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 fs-7 rounded-3" role="alert">
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label fw-semibold fs-7 text-secondary">
              Email address <span className="text-danger">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control rounded-3 py-2"
              placeholder="user@toktickit.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="login-password" className="form-label fw-semibold fs-7 text-secondary">
              Password <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-control rounded-start-3 py-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary rounded-end-3 px-3"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
            disabled={isSubmitting}
            style={{ backgroundColor: "#055037", borderColor: "#055037" }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top text-center text-muted fs-8">
          <p className="mb-0">CPE 334 TokTickIT Ticketing System</p>
        </div>
      </div>
    </div>
  );
};
