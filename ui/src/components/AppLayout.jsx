import React, { useCallback, useEffect, useState } from "react";
import TopNav from "./TopNav.jsx";
import SideNav from "./SideNav.jsx";
import { apiJson } from "../api.js";

export default function AppLayout({ children, isAuthed, role, onSignOut }) {
  const [user, setUser] = useState(null);

  const loadUser = useCallback(() => {
    if (!isAuthed) {
      setUser(null);
      return;
    }
    apiJson("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
  }, [isAuthed]);

  useEffect(() => {
    loadUser();
    // Refresh when the profile (name / avatar) changes elsewhere in the app.
    window.addEventListener("fixall:user-updated", loadUser);
    return () => window.removeEventListener("fixall:user-updated", loadUser);
  }, [loadUser]);

  return (
    <div className="app-shell">
      <TopNav isAuthed={isAuthed} role={role} onSignOut={onSignOut} />
      <div className="main-grid">
        <SideNav role={role} user={user} />
        <main className="page">{children}</main>
      </div>
      <footer className="footer">
        <span>FixAll © 2026</span>
        <span className="muted">Serving clients and professionals in one place.</span>
      </footer>
    </div>
  );
}
