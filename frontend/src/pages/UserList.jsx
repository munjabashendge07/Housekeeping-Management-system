import { useEffect, useState } from "react";
import api from "../services/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "housekeeper",
    phone: "",
    department: "Housekeeping",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to fetch users", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      showNotification("Please fill in Name, Email, and Password", "danger");
      return;
    }

    try {
      const res = await api.post("/users/create", newUser);
      showNotification("User created successfully!");
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "housekeeper",
        phone: "",
        department: "Housekeeping",
      });
      fetchUsers();
    } catch (error) {
      showNotification(error.response?.data?.message || "Error creating user", "danger");
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await api.put(`/users/${userId}`, { status: nextStatus });
      showNotification(`User status updated to ${nextStatus}`);
      fetchUsers();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to update status", "danger");
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      showNotification(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to update role", "danger");
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete staff account '${name}'?`)) return;

    try {
      await api.delete(`/users/${userId}`);
      showNotification("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to delete user", "danger");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-container container mt-4">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="header-title">Staff & User Management</h2>
          <p className="text-muted mb-0">Manage housekeeper staff accounts, assign roles, and toggle access.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Staff
        </button>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show`} role="alert">
          {feedback.message}
        </div>
      )}

      {/* Metrics Summary */}
      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-2">
          <div className="stat-card p-3 shadow-sm rounded bg-white border-start border-primary border-4">
            <span className="text-muted small">Total Staff</span>
            <h3 className="mb-0 text-primary">{users.length}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="stat-card p-3 shadow-sm rounded bg-white border-start border-success border-4">
            <span className="text-muted small">Housekeepers</span>
            <h3 className="mb-0 text-success">{users.filter((u) => u.role === "housekeeper").length}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="stat-card p-3 shadow-sm rounded bg-white border-start border-info border-4">
            <span className="text-muted small">Admins</span>
            <h3 className="mb-0 text-info">{users.filter((u) => u.role === "admin").length}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="stat-card p-3 shadow-sm rounded bg-white border-start border-warning border-4">
            <span className="text-muted small">Inactive Accounts</span>
            <h3 className="mb-0 text-warning">{users.filter((u) => u.status === "Inactive").length}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 mb-4 shadow-sm border-0">
        <div className="row g-3">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Search staff by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="housekeeper">Housekeeper Only</option>
              <option value="admin">Admin Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Staff Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department / Phone</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Loading user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No staff members found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="fw-bold">{user.name}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm w-auto d-inline-block"
                        value={user.role}
                        onChange={(e) => changeUserRole(user._id, e.target.value)}
                      >
                        <option value="housekeeper">Housekeeper</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <small className="d-block text-dark">{user.department || "Housekeeping"}</small>
                      <small className="text-muted">{user.phone || "No phone"}</small>
                    </td>
                    <td>
                      <span
                        className={`badge cursor-pointer ${
                          user.status === "Active" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                        }`}
                        onClick={() => toggleUserStatus(user._id, user.status)}
                        title="Click to toggle status"
                        style={{ cursor: "pointer", padding: "6px 10px", borderRadius: "12px" }}
                      >
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteUser(user._id, user.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Create New Staff Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="e.g. sarah@hotel.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Set account password"
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      >
                        <option value="housekeeper">Housekeeper</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        placeholder="+1 555-0192"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      placeholder="e.g. Floor 3 Housekeeping"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
