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
      ) : (
        <div className="side-section">
          <p className="side-title">Dashboards</p>
          {isPro ? (
            <>
              <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/professional">
                Professional jobs
              </NavLink>
              <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/profile">
                Profile settings
              </NavLink>
            </>
          ) : (
            <>
              <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/client">
                Client overview
              </NavLink>
              <NavLink className={({ isActive }) => (isActive ? "side-link active" : "side-link")} to="/client/request/new">
                New request
              </NavLink>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
