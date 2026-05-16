import React, { useState } from "react";
import { apiJson } from "../../api.js";
import { setAuth } from "../../auth.js";
import { Link } from "react-router-dom";

const TEST_ACCOUNTS = {
  client: { email: "client@test.com", password: "Password123!" },
  professional: { email: "pro@test.com", password: "Password123!" }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const data = await apiJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (!data?.token) {
        setError("Login failed. Check your credentials.");
        return;
      }

      setAuth({ token: data.token, role: data.role, userId: data.userId });
      window.location.href = data.role === "PROFESSIONAL" ? "/professional" : "/client";
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  };

  const applyTestAccount = (type) => {
    const account = TEST_ACCOUNTS[type];
    if (!account) return;
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src="/fixall-logo.jpg" alt="FixAll logo" />
        <div className="page-header">
          <h2>Login</h2>
          <p className="muted">Welcome back. Sign in to manage your requests.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <div className="test-row">
            <span className="test-label">Test accounts</span>
            <button className="btn ghost" type="button" onClick={() => applyTestAccount("client")}>
              Client
            </button>
            <button className="btn ghost" type="button" onClick={() => applyTestAccount("professional")}>
              Professional
            </button>
          </div>
          {error ? <p className="small-muted">{error}</p> : null}
          <div className="row">
            <button className="btn primary" type="submit">Sign in</button>
            <Link className="btn ghost" to="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

