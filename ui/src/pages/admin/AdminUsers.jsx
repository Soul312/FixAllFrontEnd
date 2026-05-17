import React, { useEffect, useState } from "react";
import { apiJson, apiFetch } from "../../api.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const loadUsers = () => {
    setLoading(true);
    apiJson("/api/admin/users")
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const changeRole = async (userId, newRole) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      setActionMsg(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      setActionMsg("Failed: " + err.message);
    }
  };

  const verify = async (userId, action) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      setActionMsg(`Professional ${action.toLowerCase()}d`);
      loadUsers();
    } catch (err) {
      setActionMsg("Failed: " + err.message);
    }
  };

  const roleColor = (role) => {
    if (role === "ADMIN") return "#7c3aed";
    if (role === "PROFESSIONAL") return "#0369a1";
    return "#1f8f4d";
  };

  const verificationColor = (status) => {
    if (status === "VERIFIED") return "#1f8f4d";
    if (status === "PENDING") return "#d97706";
    return "#dc2626";
  };

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">User management</p>
          <h2>All Users</h2>
          <p className="muted">View, edit roles, and manage professional verifications.</p>
        </div>
      </section>

      {actionMsg && (
        <div className="panel" style={{ background: "#ecfdf3", border: "1px solid #1f8f4d" }}>
          <p style={{ margin: 0 }}>{actionMsg}</p>
        </div>
      )}

      {loading ? (
        <p className="muted">Loading users...</p>
      ) : (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Users</h3>
              <p className="muted">{users.length} total</p>
            </div>
            <span className="pill">{users.length} users</span>
          </div>
          <div className="card-grid">
            {users.map((user) => (
              <article className="card-item" key={user.id}>
                <div className="card-head">
                  <strong>{user.fullName || user.email}</strong>
                  <span className="badge" style={{ background: roleColor(user.role) + "20", color: roleColor(user.role) }}>
                    {user.role}
                  </span>
                </div>
                <p className="muted">{user.email}</p>
                <div className="card-meta">
                  <span style={{ color: verificationColor(user.verificationStatus) }}>
                    {user.verificationStatus}
                  </span>
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}</span>
                </div>
                <div className="row" style={{ flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {user.role !== "ADMIN" && (
                    <select
                      className="btn ghost"
                      style={{ padding: "6px 10px", fontSize: "12px" }}
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) changeRole(user.id, e.target.value);
                        e.target.value = "";
                      }}
                    >
                      <option value="" disabled>Change role...</option>
                      <option value="CLIENT">Client</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  )}
                  {user.role === "PROFESSIONAL" && user.verificationStatus === "PENDING" && (
                    <>
                      <button className="btn primary" style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => verify(user.id, "APPROVE")}>
                        ✓ Approve
                      </button>
                      <button className="btn ghost" style={{ fontSize: "12px", padding: "6px 12px", color: "#dc2626" }}
                        onClick={() => verify(user.id, "REJECT")}>
                        ✕ Reject
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
