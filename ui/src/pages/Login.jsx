import React, { useState } from "react";
import { apiJson } from "../api.js";
import { setAuth } from "../auth.js";

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

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        {error ? <p className="small-muted">{error}</p> : null}
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

