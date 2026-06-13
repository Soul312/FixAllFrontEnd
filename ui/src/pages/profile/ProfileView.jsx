import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "../../api.js";
import { getAuth } from "../../auth.js";

export default function ProfileView() {
  const role = getAuth()?.role;
  const isPro = role === "PROFESSIONAL";

  const [me, setMe] = useState(null);
  const [proProfile, setProProfile] = useState(null);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    let isMounted = true;

    const requests = [apiJson("/api/auth/me")];
    if (isPro) requests.push(apiJson("/api/pro/profile"));

    Promise.all(requests)
      .then(([user, profile]) => {
        if (!isMounted) return;
        setMe(user);
        if (isPro) setProProfile(profile);
        setStatus("");
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus(err.message || "Failed to load profile.");
      });

    return () => {
      isMounted = false;
    };
  }, [isPro]);

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Account</p>
          <h2>Your profile</h2>
          <p className="muted">View your account details. Use Edit to make changes.</p>
        </div>
        <div className="row">
          <Link to="/profile/edit" className="btn primary">
            Edit profile
          </Link>
        </div>
      </section>

      {status && status !== "Loading..." && (
        <div className="error-banner">
          <span className="error-banner-icon">!</span>
          <span>{status}</span>
        </div>
      )}
      {status === "Loading..." && <p className="muted">Loading...</p>}

      {me && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Account details</h3>
              <p className="muted">Your personal information.</p>
            </div>
            <span className="pill">{me.role}</span>
          </div>
          <div className="card-item">
            <div className="card-meta" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
              <span><strong>Full name:</strong> {me.fullName || "—"}</span>
              <span><strong>Email:</strong> {me.email}</span>
              <span><strong>Phone:</strong> {me.phone || "—"}</span>
            </div>
          </div>
        </section>
      )}

      {isPro && me && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Professional profile</h3>
              <p className="muted">How your services appear to clients.</p>
            </div>
          </div>
          <div className="card-item">
            <div className="card-head">
              <strong>{proProfile?.businessName || "Business name not set"}</strong>
              <span className="status-chip">Active</span>
            </div>
            <p className="muted">{proProfile?.bio || "No bio added yet."}</p>
            <div className="card-meta">
              <span>
                {proProfile?.categories?.length
                  ? proProfile.categories.join(", ")
                  : "Categories not set"}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
