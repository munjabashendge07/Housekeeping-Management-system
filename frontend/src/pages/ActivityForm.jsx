import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ActivityForm() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    roomNumber: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    userId: "",
  });

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStaff();
    }
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/users");
      setStaffList(res.data.filter((u) => u.role === "housekeeper"));
    } catch (error) {
      console.error("Failed to load staff list", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.taskName) {
      setFeedback({ message: "Task name is required.", type: "danger" });
      return;
    }

    try {
      setLoading(true);
      await api.post("/activity/add", formData);
      setFeedback({ message: "Task / Activity added successfully!", type: "success" });

      setTimeout(() => {
        navigate("/activities");
      }, 1200);
    } catch (error) {
      setFeedback({
        message: error.response?.data?.message || "Error adding task activity.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container mt-4" style={{ maxWidth: "680px" }}>
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-1">Create Housekeeping Task</h3>
        <p className="text-muted small mb-4">Assign room cleaning, deep cleaning, or maintenance tasks.</p>

        {feedback.message && (
          <div className={`alert alert-${feedback.type} mb-3`} role="alert">
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Task Title *</label>
            <input
              type="text"
              name="taskName"
              className="form-control"
              placeholder="e.g. Deep Clean & Refresh Amenities"
              value={formData.taskName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Task Description / Instructions</label>
            <textarea
              name="description"
              className="form-control"
              rows="2"
              placeholder="Optional notes or guest preferences..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Room / Location Number</label>
              <input
                type="text"
                name="roomNumber"
                className="form-control"
                placeholder="e.g. Room 304 / Lobby Suite"
                value={formData.roomNumber}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Priority Level</label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Initial Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {user?.role === "admin" && (
              <div className="col-md-6">
                <label className="form-label fw-semibold">Assign Housekeeper Staff</label>
                <select
                  name="userId"
                  className="form-select"
                  value={formData.userId}
                  onChange={handleChange}
                >
                  <option value="">-- Assign to Me / Unassigned --</option>
                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.department || "Housekeeping"})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/activities")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-info text-white px-4" disabled={loading}>
              {loading ? "Creating..." : "Save Task Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActivityForm;