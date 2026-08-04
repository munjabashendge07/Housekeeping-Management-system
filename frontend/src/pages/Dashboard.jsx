import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    users: 0,
    leaves: 0,
    goods: 0,
    activities: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      setLoading(true);

      const [usersRes, leavesRes, goodsRes, activitiesRes] = await Promise.allSettled([
        api.get("/users/count"),
        api.get("/leaves/count"),
        api.get("/goods/count"),
        api.get("/activity/count"),
      ]);

      setCounts({
        users: usersRes.status === "fulfilled" ? usersRes.value.data.count : 0,
        leaves: leavesRes.status === "fulfilled" ? leavesRes.value.data.count : 0,
        goods: goodsRes.status === "fulfilled" ? goodsRes.value.data.count : 0,
        activities: activitiesRes.status === "fulfilled" ? activitiesRes.value.data.count : 0,
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container mt-4">
      {/* Welcome Hero Banner */}
      <div className="welcome-banner p-4 mb-4 rounded-3 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Welcome back, {user?.name || "User"}! 👋</h2>
            <p className="mb-0 text-slate-300">
              Role: <span className="badge bg-primary text-uppercase ms-1">{user?.role || "housekeeper"}</span> | Department: {user?.department || "Housekeeping"}
            </p>
          </div>
          <div>
            <span className="text-sm text-light opacity-75">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="row g-4 mb-5">
        {user?.role === "admin" && (
          <div className="col-md-3 col-sm-6">
            <div className="stat-card-enhanced p-4 rounded-3 shadow-sm bg-white border-0 cursor-pointer" onClick={() => navigate("/users")}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-muted text-uppercase mb-1 small fw-bold">Total Staff Users</h6>
                  <h2 className="fw-bold mb-0 text-primary">{loading ? "..." : counts.users}</h2>
                </div>
                <div className="stat-icon bg-primary-subtle text-primary p-3 rounded-circle fs-3">
                  👥
                </div>
              </div>
              <div className="mt-3 small text-primary fw-semibold">Manage Staff Accounts →</div>
            </div>
          </div>
        )}

        <div className={user?.role === "admin" ? "col-md-3 col-sm-6" : "col-md-4 col-sm-6"}>
          <div className="stat-card-enhanced p-4 rounded-3 shadow-sm bg-white border-0 cursor-pointer" onClick={() => navigate("/leaves")}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted text-uppercase mb-1 small fw-bold">
                  {user?.role === "admin" ? "Total Leaves" : "My Leaves"}
                </h6>
                <h2 className="fw-bold mb-0 text-warning">{loading ? "..." : counts.leaves}</h2>
              </div>
              <div className="stat-icon bg-warning-subtle text-warning p-3 rounded-circle fs-3">
                📅
              </div>
            </div>
            <div className="mt-3 small text-warning fw-semibold">View Leave Records →</div>
          </div>
        </div>

        <div className={user?.role === "admin" ? "col-md-3 col-sm-6" : "col-md-4 col-sm-6"}>
          <div className="stat-card-enhanced p-4 rounded-3 shadow-sm bg-white border-0 cursor-pointer" onClick={() => navigate("/goods-list")}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted text-uppercase mb-1 small fw-bold">
                  {user?.role === "admin" ? "Goods Requests" : "My Supplies Requests"}
                </h6>
                <h2 className="fw-bold mb-0 text-success">{loading ? "..." : counts.goods}</h2>
              </div>
              <div className="stat-icon bg-success-subtle text-success p-3 rounded-circle fs-3">
                📦
              </div>
            </div>
            <div className="mt-3 small text-success fw-semibold">View Goods Requests →</div>
          </div>
        </div>

        <div className={user?.role === "admin" ? "col-md-3 col-sm-6" : "col-md-4 col-sm-6"}>
          <div className="stat-card-enhanced p-4 rounded-3 shadow-sm bg-white border-0 cursor-pointer" onClick={() => navigate("/activities")}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted text-uppercase mb-1 small fw-bold">
                  {user?.role === "admin" ? "Total Tasks" : "My Assigned Tasks"}
                </h6>
                <h2 className="fw-bold mb-0 text-info">{loading ? "..." : counts.activities}</h2>
              </div>
              <div className="stat-icon bg-info-subtle text-info p-3 rounded-circle fs-3">
                📋
              </div>
            </div>
            <div className="mt-3 small text-info fw-semibold">View Task List →</div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Navigation Sections */}
      <h4 className="fw-bold mb-3">Quick Actions & Shortcuts</h4>
      <div className="row g-3">
        {user?.role === "housekeeper" ? (
          <>
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm text-center action-card" onClick={() => navigate("/activities")}>
                <div className="fs-1 mb-2">🧹</div>
                <h5 className="fw-bold">My Daily Tasks</h5>
                <p className="text-muted small">View room assignments and mark housekeeping tasks completed.</p>
                <button className="btn btn-outline-primary mt-auto">Open Tasks</button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm text-center action-card" onClick={() => navigate("/leave")}>
                <div className="fs-1 mb-2">🏖️</div>
                <h5 className="fw-bold">Apply Leave</h5>
                <p className="text-muted small">Submit new leave applications and track approval status.</p>
                <button className="btn btn-outline-warning mt-auto">Apply Now</button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm text-center action-card" onClick={() => navigate("/goods")}>
                <div className="fs-1 mb-2">🧰</div>
                <h5 className="fw-bold">Request Supplies</h5>
                <p className="text-muted small">Request cleaning chemicals, linens, amenities, and equipment.</p>
                <button className="btn btn-outline-success mt-auto">Request Goods</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col-md-3">
              <div className="card h-100 p-4 border-0 shadow-sm text-center action-card" onClick={() => navigate("/users")}>
                <div className="fs-1 mb-2">🧑‍💼</div>
                <h5 className="fw-bold">Staff Directory</h5>
                <p className="text-muted small">Manage staff members, roles, status, and account settings.</p>
                <button className="btn btn-primary mt-auto">Manage Users</button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 p-4 border-0 shadow-sm text-center action-card" onClick={() => navigate("/leaves")}>
                <div className="fs-1 mb-2">📝</div>
                <h5 className="fw-bold">Leave Approvals</h5>
                <p className="text-muted small">Review pending staff leaves, approve or decline with notes.</p>
                <button className="btn btn-warning text-dark mt-auto">Manage Leaves</button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 p-4 border-0 shadow-sm text-center action-card" onClick={() => navigate("/goods-list")}>
                <div className="fs-1 mb-2">🛒</div>
                <h5 className="fw-bold">Supply Orders</h5>
                <p className="text-muted small">Review inventory supply requests and approve dispatch.</p>
                <button className="btn btn-success mt-auto">Manage Goods</button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 p-4 border-0 shadow-sm text-center action-card" onClick={() => navigate("/activities")}>
                <div className="fs-1 mb-2">✨</div>
                <h5 className="fw-bold">Task Assignments</h5>
                <p className="text-muted small">Assign room cleaning duties and track housekeeping status.</p>
                <button className="btn btn-info text-white mt-auto">Manage Tasks</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;