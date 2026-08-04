import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LeaveForm() {
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState("Casual");
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason || !fromDate || !toDate) {
      setFeedback({ message: "Please fill in Reason, From Date, and To Date.", type: "danger" });
      return;
    }

    try {
      setLoading(true);
      await api.post("/leaves/apply", {
        leaveType,
        reason,
        fromDate,
        toDate,
      });

      setFeedback({ message: "Leave applied successfully!", type: "success" });
      setTimeout(() => {
        navigate("/leaves");
      }, 1200);
    } catch (error) {
      setFeedback({
        message: error.response?.data?.message || "Failed to submit leave application.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container mt-4" style={{ maxWidth: "650px" }}>
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-1">Apply for Leave</h3>
        <p className="text-muted small mb-4">Submit a leave application for approval by administration.</p>

        {feedback.message && (
          <div className={`alert alert-${feedback.type} mb-3`} role="alert">
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Leave Type</label>
            <select
              className="form-select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="Casual">Casual Leave</option>
              <option value="Medical">Medical / Sick Leave</option>
              <option value="Earned">Earned Leave</option>
              <option value="Emergency">Emergency Leave</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Reason for Leave *</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Provide detail for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">From Date *</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">To Date *</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/leaves")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveForm;