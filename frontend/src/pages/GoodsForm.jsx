import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function GoodsForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: 1,
    category: "Cleaning Supplies",
    urgency: "Normal",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName || formData.quantity < 1) {
      setFeedback({ message: "Please provide valid item name and quantity.", type: "danger" });
      return;
    }

    try {
      setLoading(true);
      await api.post("/goods/add", formData);
      setFeedback({ message: "Goods request submitted successfully!", type: "success" });

      setTimeout(() => {
        navigate("/goods-list");
      }, 1200);
    } catch (error) {
      setFeedback({
        message: error.response?.data?.message || "Error submitting goods request.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container mt-4" style={{ maxWidth: "650px" }}>
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-1">Request Housekeeping Supplies</h3>
        <p className="text-muted small mb-4">Request inventory items, chemicals, linens, or cleaning materials.</p>

        {feedback.message && (
          <div className={`alert alert-${feedback.type} mb-3`} role="alert">
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Item / Supply Name *</label>
            <input
              type="text"
              name="itemName"
              className="form-control"
              placeholder="e.g. Microfiber Towels, All-Purpose Disinfectant"
              value={formData.itemName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Quantity Required *</label>
              <input
                type="number"
                name="quantity"
                min="1"
                className="form-control"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Supply Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Cleaning Supplies">Cleaning Supplies</option>
                <option value="Linens & Towels">Linens & Towels</option>
                <option value="Toiletries & Amenities">Toiletries & Amenities</option>
                <option value="Maintenance Equipment">Maintenance Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Urgency Level</label>
            <div className="d-flex gap-3">
              {["Normal", "High", "Urgent"].map((level) => (
                <div key={level} className="form-check">
                  <input
                    type="radio"
                    id={`urgency-${level}`}
                    name="urgency"
                    value={level}
                    className="form-check-input"
                    checked={formData.urgency === level}
                    onChange={handleChange}
                  />
                  <label htmlFor={`urgency-${level}`} className="form-check-label fw-semibold">
                    {level === "Urgent" ? "🚨 Urgent" : level === "High" ? "⚡ High" : "Standard"}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/goods-list")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? "Submitting..." : "Submit Supply Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoodsForm;