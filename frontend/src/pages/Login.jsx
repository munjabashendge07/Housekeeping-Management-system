import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email || !formData.password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/login", formData);

      if (res.data.token && res.data.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        setErrorMsg("Unexpected response from server.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 p-4 p-md-5 rounded-4 auth-card" style={{ maxWidth: "450px", width: "100%" }}>
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">🧹</div>
          <h3 className="fw-bold">Housekeeper<span className="text-primary">HQ</span></h3>
          <p className="text-muted small">Sign in to access your housekeeping portal</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 mb-3 text-center small" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              className="form-control form-control-lg"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="form-control form-control-lg"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm mb-3" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted small">Don't have an account? </span>
          <Link to="/register" className="fw-bold text-primary text-decoration-none">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;