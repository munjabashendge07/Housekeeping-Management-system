import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/UserList";
import LeaveForm from "./pages/LeaveForm";
import LeaveList from "./pages/LeaveList";
import GoodsForm from "./pages/GoodsForm";
import GoodsList from "./pages/GoodsList";
import ActivityForm from "./pages/ActivityForm";
import ActivityList from "./pages/ActivityList";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Layout wrapper for authenticated pages that shows the Navbar
const AuthenticatedLayout = () => {
  return (
    <div className="app-main-layout">
      <Navbar />
      <main className="content-area py-3">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leave" element={<LeaveForm />} />
            <Route path="/leaves" element={<LeaveList />} />
            <Route path="/goods" element={<GoodsForm />} />
            <Route path="/goods-list" element={<GoodsList />} />
            <Route path="/activity" element={<ActivityForm />} />
            <Route path="/activities" element={<ActivityList />} />

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/users" element={<UserList />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;