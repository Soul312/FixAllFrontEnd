import React from "react";
import TopNav from "./TopNav.jsx";
import SideNav from "./SideNav.jsx";

export default function AppLayout({ children, isAuthed, role, onSignOut }) {
  return (
    <div className="app-shell">
      <TopNav isAuthed={isAuthed} role={role} onSignOut={onSignOut} />
      <div className="main-grid">
        <SideNav role={role} />
        <main className="page">{children}</main>
      </div>
      <footer className="footer">
        <span>FixAll © 2026</span>
        <span className="muted">Serving clients and professionals in one place.</span>
      </footer>
    </div>
  );
}
