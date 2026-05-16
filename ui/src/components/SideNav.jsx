import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function SideNav() {
  return (
    <aside className="side-nav">
      <div className="side-section">
        <p className="side-title">Dashboards</p>
        <NavLink className="side-link" to="/client">
          Client overview
        </NavLink>
        <NavLink className="side-link" to="/professional">
          Professional jobs
        </NavLink>
        <NavLink className="side-link" to="/profile">
          Profile settings
        </NavLink>
      </div>
      <div className="side-section">
        <p className="side-title">Quick actions</p>
        <Link className="btn primary full" to="/client/request/new">
          New request
        </Link>
        <Link className="btn ghost full" to="/login">
          Login
        </Link>
      </div>
    </aside>
  );
}

