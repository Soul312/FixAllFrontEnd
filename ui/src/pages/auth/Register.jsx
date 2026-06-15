import React, { useState } from "react";
import { apiJson } from "../../api.js";

const TEST_PROFILES = {
  client: {
    fullName: "Test Client",
    email: "client@test.com",
    password: "Password123!",
    phone: "555-0101",
    role: "CLIENT"
  },
  professional: {
    fullName: "Test Pro",
    email: "pro@test.com",
    password: "Password123!",
    phone: "555-0110",
    role: "PROFESSIONAL"
  },
  admin: {
    fullName: "Test Admin",
    email: "admin@test.com",
    password: "Password123!",
    phone: "555-0199",
    role: "ADMIN"
  }
};

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "CLIENT"
  });
  const [status, setStatus] = useState("");

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    try {
      await apiJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setStatus({ type: "success", text: "Registration complete! You can log in now." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Registration failed." });
    }
  };

  const applyTestProfile = (type) => {
    const profile = TEST_PROFILES[type];
    if (!profile) return;
    setForm(profile);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src="/fixall-logo.jpg" alt="FixAll logo" />
        <div className="page-header">
          <h2>Create account</h2>
          <p className="muted">Join FixAll to request jobs or accept new work.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Full name</label>
            <input value={form.fullName} onChange={updateField("fullName")} required />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input value={form.email} onChange={updateField("email")} type="email" required />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input value={form.password} onChange={updateField("password")} type="password" required />
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input value={form.phone} onChange={updateField("phone")} required />
          </div>
          <div className="form-row">
            <label>Role</label>
            <select value={form.role} onChange={updateField("role")}>
              <option value="CLIENT">Client</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="test-row">
            <span className="test-label">Test profiles</span>
            <button className="btn ghost" type="button" onClick={() => applyTestProfile("client")}>
              Client
            </button>
            <button className="btn ghost" type="button" onClick={() => applyTestProfile("professional")}>
              Professional
            </button>
            <button className="btn ghost" type="button" onClick={() => applyTestProfile("admin")}>
              Admin
            </button>
          </div>
          {status?.type === "error" && (
            <div className="error-banner">
              <span className="error-banner-icon">!</span>
              <span>{status.text}</span>
            </div>
          )}
          {status?.type === "success" && (
            <div className="success-banner">
              <span className="success-banner-icon">✓</span>
              <span>{status.text}</span>
            </div>
          )}
          <button className="btn primary" type="submit">Create account</button>
        </form>
      </div>
    </div>
  );
}

