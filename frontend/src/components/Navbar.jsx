import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userString = localStorage.getItem("user");
  
  if (!userString) return null;
  const user = JSON.parse(userString);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "active-link" : "";

  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="brand-logo">
          <span className="logo-icon">🧹</span>
          <span className="brand-text">Housekeeper<span className="brand-highlight">HQ</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/dashboard" className={`nav-item ${isActive("/dashboard")}`}>
            Dashboard
          </Link>

          {user?.role === "admin" && (
            <>
              <Link to="/users" className={`nav-item ${isActive("/users")}`}>
                Staff Users
              </Link>
              <Link to="/leaves" className={`nav-item ${isActive("/leaves")}`}>
                Manage Leaves
              </Link>
              <Link to="/goods-list" className={`nav-item ${isActive("/goods-list")}`}>
                Goods Requests
              </Link>
              <Link to="/activities" className={`nav-item ${isActive("/activities")}`}>
                Task Management
              </Link>
            </>
          )}

          {user?.role === "housekeeper" && (
            <>
              <Link to="/activities" className={`nav-item ${isActive("/activities")}`}>
                My Tasks
              </Link>
              <Link to="/leave" className={`nav-item ${isActive("/leave")}`}>
                Apply Leave
              </Link>
              <Link to="/leaves" className={`nav-item ${isActive("/leaves")}`}>
                My Leaves
              </Link>
              <Link to="/goods" className={`nav-item ${isActive("/goods")}`}>
                Request Supplies
              </Link>
              <Link to="/goods-list" className={`nav-item ${isActive("/goods-list")}`}>
                My Goods
              </Link>
            </>
          )}
        </div>

        <div className="user-profile-section">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`role-badge ${user?.role}`}>
              {user?.role === "admin" ? "Admin" : "Housekeeper"}
            </span>
          </div>

          <button onClick={handleLogout} className="logout-btn" title="Logout Account">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
