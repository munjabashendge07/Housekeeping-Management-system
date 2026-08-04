import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "housekeeper",
    phone: "",
    department: "Housekeeping",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg("Name, email, and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/register", formData);

      if (res.data.token && res.data.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="card shadow-lg border-0 p-4 p-md-5 rounded-4 auth-card" style={{ maxWidth: "500px", width: "100%" }}>
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">🧹</div>
          <h3 className="fw-bold">Create Account</h3>
          <p className="text-muted small">Join HousekeeperHQ staff portal</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 mb-3 text-center small" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="john@hotel.com"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label fw-semibold">Role</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="housekeeper">Housekeeper</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="+1 555-0100"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Department</label>
            <input
              type="text"
              name="department"
              placeholder="e.g. Housekeeping - Floor 2"
              className="form-control"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <button className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm mb-3" disabled={loading}>
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <div className="text-center mt-2">
          <span className="text-muted small">Already have an account? </span>
          <Link to="/" className="fw-bold text-primary text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;