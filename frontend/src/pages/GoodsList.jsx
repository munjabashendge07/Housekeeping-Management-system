import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function GoodsList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [adminNotes, setAdminNotes] = useState({});
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchGoods();
  }, [statusFilter]);

  const showNotification = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  const fetchGoods = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "All" ? "/goods" : `/goods?status=${statusFilter}`;
      const res = await api.get(url);
      setGoods(res.data);
    } catch (error) {
      showNotification(error.response?.data?.message || "Error fetching goods requests", "danger");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const notes = adminNotes[id] || "";
      await api.put(`/goods/${id}`, { status, adminNotes: notes });
      showNotification(`Request status updated to ${status}!`);
      fetchGoods();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to update request", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supply request?")) return;
    try {
      await api.delete(`/goods/${id}`);
      showNotification("Supply request deleted successfully!");
      fetchGoods();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to delete request", "danger");
    }
  };

  return (
    <div className="page-container container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="header-title mb-1">
            {user?.role === "admin" ? "Supply Orders & Requests" : "My Supply Requests"}
          </h2>
          <p className="text-muted mb-0">
            {user?.role === "admin"
              ? "Review staff requests for housekeeping materials and approve inventory dispatch."
              : "View the status of your requested materials."}
          </p>
        </div>

        {user?.role === "housekeeper" && (
          <button className="btn btn-success" onClick={() => navigate("/goods")}>
            + Request Supplies
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
                className={`btn btn-sm ${statusFilter === tab ? "btn-success" : "btn-outline-secondary"}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-muted small">Total Requests: {goods.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                {user?.role === "admin" && <th>Requested By</th>}
                <th>Item & Category</th>
                <th>Qty</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Admin Notes</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Loading requests...
                  </td>
                </tr>
              ) : goods.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No supply requests found.
                  </td>
                </tr>
              ) : (
                goods.map((item) => (
                  <tr key={item._id}>
                    {user?.role === "admin" && (
                      <td>
                        <div className="fw-bold">{item.userId?.name || "Unknown Staff"}</div>
                        <small className="text-muted">{item.userId?.department || "Housekeeping"}</small>
                      </td>
                    )}
                    <td>
                      <div className="fw-bold">{item.itemName}</div>
                      <small className="text-muted">{item.category || "Cleaning Supplies"}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1 fs-6">
                        {item.quantity}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.urgency === "Urgent"
                            ? "bg-danger"
                            : item.urgency === "High"
                            ? "bg-warning text-dark"
                            : "bg-secondary-subtle text-secondary"
                        }`}
                      >
                        {item.urgency || "Normal"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === "Approved"
                            ? "bg-success"
                            : item.status === "Rejected"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {user?.role === "admin" && item.status === "Pending" ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Optional note..."
                          value={adminNotes[item._id] || ""}
                          onChange={(e) =>
                            setAdminNotes({
                              ...adminNotes,
                              [item._id]: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <small className="text-muted">{item.adminNotes || "-"}</small>
                      )}
                    </td>
                    <td className="text-end">
                      {user?.role === "admin" ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-success"
                            onClick={() => updateStatus(item._id, "Approved")}
                            disabled={item.status === "Approved"}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => updateStatus(item._id, "Rejected")}
                            disabled={item.status === "Rejected"}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(item._id)}
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

export default GoodsList;