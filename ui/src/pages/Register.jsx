import React, { useState } from "react";
import { apiJson } from "../api.js";

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
      setStatus("Registration complete. You can log in now.");
    } catch (err) {
      setStatus(err.message || "Registration failed.");
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
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
          </select>
        </div>
        {status ? <p className="small-muted">{status}</p> : null}
        <button type="submit">Create account</button>
      </form>
    </div>
  );
}

