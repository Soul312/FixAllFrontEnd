import React from "react";
import { NavLink } from "react-router-dom";

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

export default function SideNav({ role }) {
  const isPro = role === "PROFESSIONAL";
  const isAdmin = role === "ADMIN";

  return (
    <aside className="side-nav">
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
