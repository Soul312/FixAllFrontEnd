import React from "react";
import { Link } from "react-router-dom";

export default function TopNav({ isAuthed, role, onSignOut }) {
  const isPro = role === "PROFESSIONAL";

  return (
    <header className="top-nav">
      <div className="brand">
        <img className="logo-img" src="/fixall-logo.jpg" alt="FixAll logo" />
        <span>FixAll</span>
      </div>
      <nav className="nav-links">
        {isPro ? (
          <>
            <Link to="/professional">Jobs</Link>
            <Link to="/profile">Profile</Link>
          </>
        ) : (
          <>
            <Link to="/client">Dashboard</Link>
            <Link to="/client/request/new">New request</Link>
          </>
        )}
      </nav>
      <div className="nav-actions">
        {!isAuthed ? (
          <>
            <Link to="/login" className="btn ghost">
              Login
            </Link>
            <Link to="/register" className="btn primary">
              Register
            </Link>
          </>
        ) : (
          <button className="btn subtle" onClick={onSignOut}>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
