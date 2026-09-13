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

  // Filters
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
    loadUsers();
  }, [search, roleFilter, activeFilter, page]);

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError("");

    try {
      await updateAdminUser(editingUser.id, {
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

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditDepartment(user.department || "");
    setEditIsActive(user.isActive);
    setEditError("");
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

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            👥 Administrator User Management
          </h1>
          <p className="text-muted small mb-0">
            Create users, manage roles, toggle active accounts, and reset passwords.
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

      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
      {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}

      {/* Toolbar Filters */}
      <div className="zen-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control zen-form-control form-control-sm"
              placeholder="🔍 Search name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="col-6 col-md-3">
            <select
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

          <div className="col-6 col-md-4">
            <select
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
        </div>
      </div>

      {/* Users Table */}
      <div className="zen-card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-success spinner-border-sm mb-2" role="status" />
            <div>Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="mb-0 fw-semibold">No users found matching search criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
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
        )}

        {/* Pagination Footer */}
        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-white">
          <span className="text-muted small">
            Showing {users.length} of {totalItems} total users
          </span>
          <div className="d-flex gap-2">
            <button
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
                    User will be required to change password on first login.
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
              <h2 className="h5 fw-bold mb-1">✏️ Edit User: {editingUser.name}</h2>
              <p className="text-muted small mb-3">{editingUser.email}</p>

              {editError && <div className="alert alert-danger py-2 small mb-3">{editError}</div>}

              <form onSubmit={handleEditSubmit}>
                <div className="mb-3">
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

                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Department</label>
                  <input
                    type="text"
                    className="form-control zen-form-control"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                  />
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
                    Account Active Status
                  </label>
                  {currentAdmin?.id === editingUser.id && (
                    <div className="text-danger extra-small">
                      You cannot deactivate your own admin account.
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
                Resetting password for <strong>{resettingUser.name}</strong> ({resettingUser.email}).
              </p>

              {resetError && <div className="alert alert-danger py-2 small mb-3">{resetError}</div>}

              <form onSubmit={handleResetSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold small mb-1">New Password</label>
                  <input
                    type="text"
                    className="form-control zen-form-control"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="text-muted extra-small mt-1">
                    Sets <code>mustChangePassword: true</code> on the user.
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
