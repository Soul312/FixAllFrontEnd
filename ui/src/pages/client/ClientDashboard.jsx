import React, { useEffect, useState } from "react";
import { apiJson } from "../../api.js";
import { Link } from "react-router-dom";

export default function ClientDashboard() {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    let isMounted = true;

    apiJson("/api/requests/my")
      .then((data) => {
        if (!isMounted) return;
        setJobs(data || []);
        setStatus("");
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus(err.message || "Failed to load requests.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Client dashboard</p>
          <h2>Track your active requests</h2>
          <p className="muted">Create new requests and stay up to date with progress.</p>
        </div>
        <div className="row">
          <Link to="/client/request/new" className="btn primary">
            + New request
          </Link>
          <Link to="/client/request/new" className="btn ghost">
            Quick diagnosis
          </Link>
        </div>
      </section>

      <section className="grid-3">
        <div className="stat-card">
          <h4>Open requests</h4>
          <strong>{jobs.filter((job) => job.status !== "COMPLETED").length}</strong>
          <p className="small-muted">Active and accepted</p>
        </div>
        <div className="stat-card">
          <h4>Completed</h4>
          <strong>{jobs.filter((job) => job.status === "COMPLETED").length}</strong>
          <p className="small-muted">All-time completed</p>
        </div>
        <div className="stat-card">
          <h4>Need attention</h4>
          <strong>{status ? "!" : 0}</strong>
          <p className="small-muted">Status updates</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Active requests</h3>
            <p className="muted">Latest requests and progress updates.</p>
          </div>
          <span className="pill">{jobs.length} total</span>
        </div>
        {status ? <p className="small-muted">{status}</p> : null}
        <div className="card-grid">
          {jobs.map((job) => (
            <article className="card-item" key={job.id}>
              <div className="card-head">
                <strong>{job.title}</strong>
                <span className="status-chip">{job.status}</span>
              </div>
              <p className="muted">{job.description}</p>
              <div className="card-meta">
                <span>{job.category}</span>
                <span>Lat {job.latitude} · Lng {job.longitude}</span>
              </div>
            </article>
          ))}
          {!status && jobs.length === 0 ? (
            <div className="empty-state">
              <h4>No active requests yet</h4>
              <p className="muted">Create your first request to get started.</p>
              <Link to="/client/request/new" className="btn primary">
                Create request
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
