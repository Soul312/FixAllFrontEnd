import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="stack-lg">
      <section className="hero">
        <div>
          <p className="eyebrow">FixAll • Trusted local pros</p>
          <h1>Repairs made simple.</h1>
          <p className="muted">
            Post a request, get matched with nearby professionals, and track the job in one place.
          </p>
          <div className="row">
            <Link to="/register" className="btn primary">Get started</Link>
            <Link to="/professional" className="btn ghost">Find jobs</Link>
          </div>
          <div className="row">
            <span className="badge">Fast</span>
            <span className="badge">Secure</span>
            <span className="badge">Local</span>
          </div>
        </div>
        <div className="hero-card">
          <h3>Active requests</h3>
          <div className="card-list">
            <div className="mini-card">
              <strong>Leaky faucet</strong>
              <p className="muted">Plumbing · Requested</p>
            </div>
            <div className="mini-card">
              <strong>Power outlet fix</strong>
              <p className="muted">Electrical · Accepted</p>
            </div>
            <div className="mini-card">
              <strong>AC tune-up</strong>
              <p className="muted">HVAC · Requested</p>
            </div>
          </div>
          <Link to="/client" className="text-link">Open dashboard →</Link>
        </div>
      </section>

      <section className="grid-3">
        <div className="info-card">
          <h3>One-tap requests</h3>
          <p className="muted">Describe the issue and share your location to reach the right pro.</p>
        </div>
        <div className="info-card">
          <h3>Nearby pros</h3>
          <p className="muted">Professionals see local jobs and accept the ones that fit.</p>
        </div>
        <div className="info-card">
          <h3>Track progress</h3>
          <p className="muted">Updates stay visible in your dashboard from request to completion.</p>
        </div>
      </section>
    </div>
  );
}


