import React from "react";
import { NavLink } from "react-router-dom";

export default function SideNav({ role }) {
  const isPro = role === "PROFESSIONAL";
  const isAdmin = role === "ADMIN";

  return (
    <aside className="side-nav">
      {isAdmin ? (
        <div className="side-section">
          <p className="side-title">Administration</p>
          <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/admin">
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/admin/users">
            Users
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/admin/jobs">
            Jobs
          </NavLink>
        </div>
      ) : isPro ? (
        <>
          <div className="side-section">
            <p className="side-title">Dashboards</p>
            <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/professional">
              Available jobs
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/professional/jobs">
              My jobs
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/professional/earnings">
              Earnings
            </NavLink>
          </div>
          <div className="side-section">
            <p className="side-title">Account</p>
            <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/profile">
              Profile settings
            </NavLink>
          </div>
        </>
      ) : (
        <>
          <div className="side-section">
            <p className="side-title">Dashboards</p>
            <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/client">
              My requests
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/client/request/new">
              New request
            </NavLink>
          </div>
        </>
      )}
    </aside>
  );
}
