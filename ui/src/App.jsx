import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ClientDashboard from "./pages/client/ClientDashboard.jsx";
import NewRequest from "./pages/client/NewRequest.jsx";
import JobDetail from "./pages/client/JobDetail.jsx";
import RateJob from "./pages/client/RateJob.jsx";
import PayJob from "./pages/client/PayJob.jsx";
import ProfessionalDashboard from "./pages/pro/ProfessionalDashboard.jsx";
import Profile from "./pages/pro/Profile.jsx";
import ProJobs from "./pages/pro/ProJobs.jsx";
import ProEarnings from "./pages/pro/ProEarnings.jsx";
import Home from "./pages/home/Home.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminJobs from "./pages/admin/AdminJobs.jsx";
import { getAuth, clearAuth } from "./auth.js";
import AppLayout from "./components/AppLayout.jsx";

export default function App() {
  const auth = getAuth();
  const location = useLocation();
  const role = auth?.role;
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="page">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  const defaultRoute = role === "ADMIN" ? "/admin" : role === "PROFESSIONAL" ? "/professional" : "/client";

  return (
    <AppLayout
      isAuthed={Boolean(auth?.token)}
      role={role}
      onSignOut={() => {
        clearAuth();
        window.location.href = "/login";
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        {/* Client routes */}
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client/request/new" element={<NewRequest />} />
        <Route path="/client/request/:id" element={<JobDetail />} />
        <Route path="/client/request/:id/rate" element={<RateJob />} />
        <Route path="/client/request/:id/pay" element={<PayJob />} />
        {/* Professional routes */}
        <Route path="/professional" element={<ProfessionalDashboard />} />
        <Route path="/professional/jobs" element={<ProJobs />} />
        <Route path="/professional/earnings" element={<ProEarnings />} />
        <Route path="/profile" element={<Profile />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
      </Routes>
    </AppLayout>
  );
}
