import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LeaveList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLeaveNotes, setSelectedLeaveNotes] = useState({});
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const showNotification = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "All" ? "/leaves" : `/leaves?status=${statusFilter}`;
      const res = await api.get(url);
      setLeaves(res.data);
    } catch (error) {
      showNotification(error.response?.data?.message || "Error fetching leave applications", "danger");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const adminNotes = selectedLeaveNotes[id] || "";
      await api.put(`/leaves/${id}`, { status, adminNotes });
      showNotification(`Leave application status updated to ${status}!`);
      fetchLeaves();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to update status", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave application?")) return;
    try {
      await api.delete(`/leaves/${id}`);
      showNotification("Leave request deleted!");
      fetchLeaves();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to delete leave", "danger");
    }
  };

  return (
    <div className="page-container container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="header-title mb-1">
            {user?.role === "admin" ? "Staff Leave Applications" : "My Leave Applications"}
          </h2>
          <p className="text-muted mb-0">
            {user?.role === "admin"
              ? "Review staff absence requests, grant approvals, or leave admin notes."
              : "Track the status of your submitted leave applications."}
          </p>
        </div>

        {user?.role === "housekeeper" && (
          <button className="btn btn-primary" onClick={() => navigate("/leave")}>
            + Apply New Leave
          </button>
        )}
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show`} role="alert">
          {feedback.message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="btn-group" role="group">
            {["All", "Pending", "Approved", "Rejected"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`btn btn-sm ${statusFilter === tab ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-muted small">Total Records: {leaves.length}</span>
        </div>
      </div>

      {/* Leave Table / Cards */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                {user?.role === "admin" && <th>Applicant</th>}
                <th>Type</th>
                <th>Reason</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Admin Notes</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Loading leave records...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No leave records found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id}>
                    {user?.role === "admin" && (
                      <td>
                        <div className="fw-bold">{leave.userId?.name || "Unknown"}</div>
                        <small className="text-muted">{leave.userId?.department || "Staff"}</small>
                      </td>
                    )}
                    <td>
                      <span className="badge bg-light text-dark border">
                        {leave.leaveType || "Casual"}
                      </span>
                    </td>
                    <td style={{ maxWidth: "250px" }}>{leave.reason}</td>
                    <td>
                      <small className="d-block text-dark fw-semibold">
                        {leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : ""} -{" "}
                        {leave.toDate ? new Date(leave.toDate).toLocaleDateString() : ""}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          leave.status === "Approved"
                            ? "bg-success"
                            : leave.status === "Rejected"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {user?.role === "admin" && leave.status === "Pending" ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Optional note..."
                          value={selectedLeaveNotes[leave._id] || ""}
                          onChange={(e) =>
                            setSelectedLeaveNotes({
                              ...selectedLeaveNotes,
                              [leave._id]: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <small className="text-muted">{leave.adminNotes || "-"}</small>
                      )}
                    </td>
                    <td className="text-end">
                      {user?.role === "admin" ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-success"
                            onClick={() => updateStatus(leave._id, "Approved")}
                            disabled={leave.status === "Approved"}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => updateStatus(leave._id, "Rejected")}
                            disabled={leave.status === "Rejected"}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(leave._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeaveList;