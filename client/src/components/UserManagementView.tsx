import React, { useState, useEffect } from "react";
import {
  User,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
} from "../api.js";
import { useAuth } from "../context/AuthContext.js";

export const UserManagementView: React.FC = () => {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Search & Role Filters
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  // Form states - Create User
  const [createName, setCreateName] = useState<string>("");
  const [createEmail, setCreateEmail] = useState<string>("");
  const [createRole, setCreateRole] = useState<"REQUESTER" | "IT_STAFF" | "ADMINISTRATOR">("REQUESTER");
  const [createDepartment, setCreateDepartment] = useState<string>("");
  const [createPassword, setCreatePassword] = useState<string>("Password123!");
  const [createError, setCreateError] = useState<string>("");

  // Form states - Edit User
  const [editName, setEditName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editRole, setEditRole] = useState<"REQUESTER" | "IT_STAFF" | "ADMINISTRATOR">("REQUESTER");
  const [editDepartment, setEditDepartment] = useState<string>("");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editError, setEditError] = useState<string>("");

  // Form states - Reset Password
  const [newPassword, setNewPassword] = useState<string>("Password123!");
  const [resetError, setResetError] = useState<string>("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      let activeParam: boolean | undefined = undefined;
      if (activeFilter === "true") activeParam = true;
      if (activeFilter === "false") activeParam = false;

      const res = await fetchAdminUsers({
        search,
        role: roleFilter,
        isActive: activeParam,
        page,
        pageSize: 10,
      });

      setUsers(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.totalItems);
    } catch (err: any) {
      setError(err?.message || "Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAdmin && currentAdmin.role !== "ADMINISTRATOR") return;
    loadUsers();
  }, [search, roleFilter, activeFilter, page, currentAdmin]);

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setActiveFilter("");
    setPage(1);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    if (!createName.trim() || !createEmail.trim()) {
      setCreateError("Name and Email are required.");
      return;
    }

    try {
      await createAdminUser({
        name: createName.trim(),
        email: createEmail.trim(),
        role: createRole,
        department: createDepartment.trim() || undefined,
        initialPassword: createPassword.trim() || "Password123!",
      });

      setShowCreateModal(false);
      setCreateName("");
      setCreateEmail("");
      setCreateDepartment("");
      setCreatePassword("Password123!");
      setSuccess("User created successfully!");
      loadUsers();
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create user");
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDepartment(u.department || "");
    setEditIsActive(u.isActive);
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError("");

    if (!editName.trim() || !editEmail.trim()) {
      setEditError("Name and Email are required.");
      return;
    }

    try {
      await updateAdminUser(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        department: editDepartment.trim() || undefined,
        isActive: editIsActive,
      });

      setEditingUser(null);
      setSuccess("User updated successfully!");
      loadUsers();
    } catch (err: any) {
      setEditError(err?.message || "Failed to update user");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setResetError("");

    try {
      await resetAdminUserPassword(resettingUser.id, newPassword.trim());
      setResettingUser(null);
      setNewPassword("Password123!");
      setSuccess(`Password for ${resettingUser.name} reset successfully!`);
      loadUsers();
    } catch (err: any) {
      setResetError(err?.message || "Failed to reset password");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMINISTRATOR":
        return <span className="badge bg-danger text-white">Administrator</span>;
      case "IT_STAFF":
        return <span className="badge bg-primary text-white">IT Staff</span>;
      default:
        return <span className="badge bg-secondary text-white">Requester</span>;
    }
  };

  // Forbidden State Guard (Role Authorization)
  if (currentAdmin && currentAdmin.role !== "ADMINISTRATOR") {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm border-0 p-4 rounded-4" role="alert">
          <div className="d-flex align-items-center gap-3">
            <span className="fs-1">🚫</span>
            <div>
              <h4 className="fw-bold mb-1">Access Denied (403 Forbidden)</h4>
              <p className="mb-0 small text-secondary">
                You do not have permission to view or manage users. An Administrator role is required.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFiltered = Boolean(search) || Boolean(roleFilter) || Boolean(activeFilter);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            👥 Administrator User Management
          </h1>
          <p className="text-muted small mb-0">
            Create users, assign roles, toggle active status, and set initial passwords.
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn zen-btn-primary d-flex align-items-center gap-2"
            onClick={() => {
              setShowCreateModal(true);
              setCreateError("");
            }}
          >
            ➕ Create New User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4 py-3" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span>⚠️</span>
            <span className="small fw-medium">{error}</span>
          </div>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={loadUsers}>
            🔄 Retry
          </button>
        </div>
      )}

      {success && <div className="alert alert-success py-2 small mb-4">{success}</div>}

      {/* Toolbar Filters */}
      <div className="zen-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control zen-form-control form-control-sm"
              placeholder="🔍 Search user by name or email..."
              aria-label="Search user by name or email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="col-6 col-md-3">
            <select
              aria-label="Filter by Role"
              className="form-select zen-form-control form-select-sm"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="REQUESTER">Requester</option>
              <option value="IT_STAFF">IT Staff</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              aria-label="Filter by Active Status"
              className="form-select zen-form-control form-select-sm"
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Account Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {isFiltered && (
            <div className="col-12 col-md-1 text-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100 text-nowrap"
                onClick={handleClearFilters}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Content Container */}
      <div className="zen-card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-success spinner-border-sm mb-2" role="status" />
            <div className="small">Loading user directory...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 px-3">
            {isFiltered ? (
              <div>
                <span className="fs-1 d-block mb-2">🔍</span>
                <h3 className="h6 fw-bold text-dark mb-1">No Users Found</h3>
                <p className="text-muted small mb-3">No users match your specified search or filter parameters.</p>
                <button type="button" className="btn zen-btn-primary btn-sm" onClick={handleClearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <span className="fs-1 d-block mb-2">👥</span>
                <h3 className="h6 fw-bold text-dark mb-1">User List Empty</h3>
                <p className="text-muted small mb-0">There are currently no user accounts created in the system.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table View (> 768px) */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User / Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Password Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="fw-semibold small text-dark">{u.name}</div>
                        <div className="text-muted extra-small">{u.email}</div>
                      </td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td>
                        <span className="small text-muted">{u.department || "—"}</span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="badge bg-success text-white">Active</span>
                        ) : (
                          <span className="badge bg-danger text-white">Inactive</span>
                        )}
                      </td>
                      <td>
                        {u.mustChangePassword ? (
                          <span className="badge bg-warning text-dark extra-small">
                            Must Change Password
                          </span>
                        ) : (
                          <span className="badge bg-light text-secondary extra-small border">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openEditModal(u)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              setResettingUser(u);
                              setNewPassword("Password123!");
                              setResetError("");
                            }}
                          >
                            🔑 Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (< 767px) */}
            <div className="d-block d-md-none p-3">
              <div className="d-flex flex-column gap-3">
                {users.map((u) => (
                  <div key={u.id} className="p-3 rounded-3 border bg-white shadow-sm">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h2 className="h6 fw-bold text-dark mb-0">{u.name}</h2>
                        <div className="text-muted extra-small">{u.email}</div>
                      </div>
                      <div>{getRoleBadge(u.role)}</div>
                    </div>

                    <div className="row g-2 mb-3 bg-light p-2 rounded text-muted extra-small">
                      <div className="col-6">
                        <strong>Department:</strong> {u.department || "—"}
                      </div>
                      <div className="col-6">
                        <strong>Status:</strong>{" "}
                        {u.isActive ? (
                          <span className="text-success fw-semibold">Active</span>
                        ) : (
                          <span className="text-danger fw-semibold">Inactive</span>
                        )}
                      </div>
                      <div className="col-12">
                        <strong>Password Status:</strong>{" "}
                        {u.mustChangePassword ? (
                          <span className="text-warning-emphasis fw-semibold">Must Change Password</span>
                        ) : (
                          <span>Normal</span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm py-1"
                        onClick={() => openEditModal(u)}
                      >
                        ✏️ Edit User
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm py-1"
                        onClick={() => {
                          setResettingUser(u);
                          setNewPassword("Password123!");
                          setResetError("");
                        }}
                      >
                        🔑 Reset Password
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pagination Footer */}
        <div className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 bg-white">
          <span className="text-muted small">
            Showing {totalItems === 0 ? 0 : (page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} of {totalItems} total users
          </span>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="align-self-center small fw-semibold px-2">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Create User */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content zen-card border-0 p-4">
              <h2 className="h5 fw-bold mb-3">➕ Create New User</h2>

              {createError && <div className="alert alert-danger py-2 small mb-3">{createError}</div>}

              <form onSubmit={handleCreateSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Full Name</label>
                  <input
                    type="text"
                    className="form-control zen-form-control"
                    placeholder="e.g. John Doe"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Email Address</label>
                  <input
                    type="email"
                    className="form-control zen-form-control"
                    placeholder="e.g. john@toktickit.com"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold small mb-1">Role</label>
                    <select
                      className="form-select zen-form-control"
                      value={createRole}
                      onChange={(e) =>
                        setCreateRole(e.target.value as "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR")
                      }
                    >
                      <option value="REQUESTER">Requester</option>
                      <option value="IT_STAFF">IT Staff</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small mb-1">Department</label>
                    <input
                      type="text"
                      className="form-control zen-form-control"
                      placeholder="e.g. Computer Science"
                      value={createDepartment}
                      onChange={(e) => setCreateDepartment(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small mb-1">Initial Password</label>
                  <input
                    type="text"
                    className="form-control zen-form-control"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                  />
                  <div className="text-muted extra-small mt-1">
                    User will be required to change password on first login (<code>mustChangePassword: true</code>).
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn zen-btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn zen-btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Edit User */}
      {editingUser && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content zen-card border-0 p-4">
              <h2 className="h5 fw-bold mb-1">✏️ Edit User Details</h2>
              <p className="text-muted small mb-3">Modify account info for {editingUser.name}</p>

              {editError && <div className="alert alert-danger py-2 small mb-3">{editError}</div>}

              <form onSubmit={handleEditSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Full Name</label>
                  <input
                    type="text"
                    className="form-control zen-form-control"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Email Address</label>
                  <input
                    type="email"
                    className="form-control zen-form-control"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold small mb-1">Role</label>
                    <select
                      className="form-select zen-form-control"
                      value={editRole}
                      onChange={(e) =>
                        setEditRole(e.target.value as "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR")
                      }
                    >
                      <option value="REQUESTER">Requester</option>
                      <option value="IT_STAFF">IT Staff</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small mb-1">Department</label>
                    <input
                      type="text"
                      className="form-control zen-form-control"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4 form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="activeSwitch"
                    checked={editIsActive}
                    disabled={currentAdmin?.id === editingUser.id}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold small" htmlFor="activeSwitch">
                    Account Active Status ({editIsActive ? "Active" : "Inactive"})
                  </label>
                  {currentAdmin?.id === editingUser.id && (
                    <div className="text-danger extra-small mt-1">
                      You cannot deactivate your own administrator account.
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn zen-btn-secondary"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn zen-btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Reset Password */}
      {resettingUser && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content zen-card border-0 p-4">
              <h2 className="h5 fw-bold mb-1">🔑 Reset Password</h2>
              <p className="text-muted small mb-3">
                Resetting initial password for <strong>{resettingUser.name}</strong> ({resettingUser.email}).
              </p>

              {resetError && <div className="alert alert-danger py-2 small mb-3">{resetError}</div>}

              <form onSubmit={handleResetSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold small mb-1">New Initial Password</label>
                  <input
                    type="text"
                    className="form-control zen-form-control"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="text-muted extra-small mt-1">
                    Resetting sets <code>mustChangePassword: true</code> so user changes password on next login.
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn zen-btn-secondary"
                    onClick={() => setResettingUser(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Confirm Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
