import React from "react";
import { NavLink, Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";

function NavItem({ to, icon, children, end }) {
  return (
    <NavLink
      end={end}
      className={({ isActive }) => (isActive ? "side-link active" : "side-link")}
      to={to}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {children}
    </NavLink>
  );
}

export default function SideNav({ role, user }) {
  const isPro = role === "PROFESSIONAL";
  const isAdmin = role === "ADMIN";

  const cta = isAdmin
    ? { to: "/admin", icon: "dashboard", label: "Open dashboard" }
    : isPro
    ? { to: "/professional", icon: "search", label: "Find jobs" }
    : { to: "/client/request/new", icon: "add_circle", label: "New request" };

  return (
    <aside className="side-nav">
      <Link to="/profile" className="side-profile">
        <Avatar src={user?.avatarUrl} name={user?.fullName} size={44} />
        <div className="side-profile-text">
          <span className="side-welcome">Welcome back</span>
          <span className="side-name">{user?.fullName || "Your account"}</span>
        </div>
      </Link>

      <Link to={cta.to} className="btn primary full">
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{cta.icon}</span>
        {cta.label}
      </Link>

      {isAdmin ? (
        <div className="side-section">
          <p className="side-title">Administration</p>
          <NavItem to="/admin" end icon="dashboard">Dashboard</NavItem>
          <NavItem to="/admin/users" icon="group">Users</NavItem>
          <NavItem to="/admin/jobs" icon="work">Jobs</NavItem>
          <p className="side-title">Account</p>
          <NavItem to="/profile" icon="person">Profile</NavItem>
        </div>
      ) : isPro ? (
        <>
          <div className="side-section">
            <p className="side-title">Dashboards</p>
            <NavItem to="/professional" end icon="search">Available jobs</NavItem>
            <NavItem to="/professional/jobs" icon="assignment">My jobs</NavItem>
            <NavItem to="/professional/earnings" icon="payments">Earnings</NavItem>
          </div>
          <div className="side-section">
            <p className="side-title">Account</p>
            <NavItem to="/profile" icon="person">Profile</NavItem>
          </div>
        </>
      ) : (
        <>
          <div className="side-section">
            <p className="side-title">Dashboards</p>
            <NavItem to="/client" end icon="assignment">My requests</NavItem>
            <NavItem to="/client/request/new" icon="add_circle">New request</NavItem>
          </div>
          <div className="side-section">
            <p className="side-title">Account</p>
            <NavItem to="/profile" icon="person">Profile</NavItem>
          </div>
        </>
      )}
    </aside>
  );
}
