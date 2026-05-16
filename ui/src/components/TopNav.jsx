import React from "react";
import { Link } from "react-router-dom";

export default function TopNav({ isAuthed, onSignOut }) {
  return (
    <header className="top-nav">
      <div className="brand">
        <span className="logo-dot" />
        <span>FixAll</span>
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/client">Client</Link>
        <Link to="/professional">Professional</Link>
        <Link to="/profile">Profile</Link>
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

