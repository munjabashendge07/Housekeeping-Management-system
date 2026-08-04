import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ActivityList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchActivities();
  }, [statusFilter]);

  const showNotification = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "All" ? "/activity" : `/activity?status=${statusFilter}`;
      const res = await api.get(url);
      setActivities(res.data);
    } catch (error) {
      showNotification(error.response?.data?.message || "Error loading task activities", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/activity/${id}`, { status: newStatus });
      showNotification(`Task status updated to '${newStatus}'!`);
      fetchActivities();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to update status", "danger");
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/activity/${id}`);
      showNotification("Task activity deleted successfully!");
      fetchActivities();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to delete task", "danger");
    }
  };

  return (
    <div className="page-container container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="header-title mb-1">
            {user?.role === "admin" ? "Housekeeping Task Management" : "My Daily Tasks & Activities"}
          </h2>
          <p className="text-muted mb-0">
            {user?.role === "admin"
              ? "Assign, track room cleaning progress, and monitor housekeeping staff duties."
              : "View assigned rooms and update task status as work progresses."}
          </p>
        </div>

        <button className="btn btn-info text-white" onClick={() => navigate("/activity")}>
          + Create Task / Activity
        </button>
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
            {["All", "Pending", "In Progress", "Completed"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`btn btn-sm ${statusFilter === tab ? "btn-info text-white" : "btn-outline-secondary"}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-muted small">Total Tasks: {activities.length}</span>
        </div>
      </div>

      {/* Task Activity Table */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Task & Room</th>
                {user?.role === "admin" && <th>Assigned Staff</th>}
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Loading tasks...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No task activities found.
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity._id}>
                    <td>
                      <div className="fw-bold">{activity.taskName}</div>
                      {activity.roomNumber && (
                        <span className="badge bg-light text-dark border me-1">
                          📍 {activity.roomNumber}
                        </span>
                      )}
                      {activity.description && (
                        <small className="text-muted d-block mt-1">{activity.description}</small>
                      )}
                    </td>

                    {user?.role === "admin" && (
                      <td>
                        <div className="fw-semibold text-dark">{activity.userId?.name || "Unassigned"}</div>
                        <small className="text-muted">{activity.userId?.department || "Staff"}</small>
                      </td>
                    )}

                    <td>
                      <span
                        className={`badge ${
                          activity.priority === "High"
                            ? "bg-danger"
                            : activity.priority === "Medium"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {activity.priority || "Medium"}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`form-select form-select-sm fw-semibold w-auto d-inline-block ${
                          activity.status === "Completed"
                            ? "text-success border-success"
                            : activity.status === "In Progress"
                            ? "text-info border-info"
                            : "text-warning border-warning"
                        }`}
                        value={activity.status}
                        onChange={(e) => handleStatusChange(activity._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    <td>
                      <small className="text-muted">
                        {activity.date ? new Date(activity.date).toLocaleDateString() : ""}
                      </small>
                    </td>

                    <td className="text-end">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteActivity(activity._id)}
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
    </div>
  );
}

export default ActivityList;