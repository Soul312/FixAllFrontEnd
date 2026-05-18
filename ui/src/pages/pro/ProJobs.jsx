import React, { useEffect, useState } from "react";
import { apiJson } from "../../api.js";
import { Link } from "react-router-dom";

function statusColor(status) {
  switch (status) {
    case "REQUESTED": return "#0369a1";
    case "ACCEPTED": return "#d97706";
    case "IN_PROGRESS": return "#7c3aed";
    case "COMPLETED": return "#1f8f4d";
    case "CANCELLED": return "#dc2626";
    default: return "#6b7280";
  }
}

export default function ProJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    apiJson("/api/requests/my")
      .then((data) => {
        if (!mounted) return;
        setJobs(data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load jobs.");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const completeJob = async (jobId) => {
    setActionMsg("");
    try {
      const updated = await apiJson(`/api/requests/${jobId}/complete`, { method: "PATCH" });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
      setActionMsg("Job marked as completed!");
    } catch (err) {
      setActionMsg(err.message || "Failed to complete job.");
    }
  };

  const filtered = filter
    ? jobs.filter((j) => j.status === filter)
    : jobs;

  const accepted = jobs.filter((j) => j.status === "ACCEPTED").length;
  const completed = jobs.filter((j) => j.status === "COMPLETED").length;
  const total = jobs.length;

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">My jobs</p>
          <h2>Your accepted & completed jobs</h2>
          <p className="muted">Track all jobs you've accepted, completed, or are working on.</p>
        </div>
      </section>

      <section className="grid-3">
        <div className="stat-card">
          <h4>Total jobs</h4>
          <strong>{total}</strong>
          <p className="small-muted">All jobs assigned to you</p>
        </div>
        <div className="stat-card">
          <h4>Active</h4>
          <strong style={{ color: "#d97706" }}>{accepted}</strong>
          <p className="small-muted">Currently accepted</p>
        </div>
        <div className="stat-card">
          <h4>Completed</h4>
          <strong style={{ color: "#1f8f4d" }}>{completed}</strong>
          <p className="small-muted">Successfully finished</p>
        </div>
      </section>

      {actionMsg && (
        <div className="panel" style={{ background: "#ecfdf3", border: "1px solid #1f8f4d" }}>
          <p style={{ margin: 0 }}>{actionMsg}</p>
        </div>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Job history</h3>
            <p className="muted">{filtered.length} {filter || "total"}</p>
          </div>
          <div className="row" style={{ gap: "8px" }}>
            {["", "ACCEPTED", "COMPLETED", "CANCELLED"].map((s) => (
              <button
                key={s}
                className={`btn ${filter === s ? "primary" : "ghost"}`}
                style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={() => setFilter(s)}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="muted">Loading jobs...</p>}
        {error && <p className="muted">{error}</p>}

        <div className="card-grid">
          {filtered.map((job) => (
            <article className="card-item" key={job.id}>
              <div className="card-head">
                <div className="stack-sm">
                  <strong>{job.title}</strong>
                  <span className="small-muted">{job.category}</span>
                </div>
                <span
                  className="badge"
                  style={{
                    background: statusColor(job.status) + "20",
                    color: statusColor(job.status)
                  }}
                >
                  {job.status}
                </span>
              </div>
              <p className="muted">{job.description}</p>
              <div className="card-meta">
                <span>Client: {job.clientName || "N/A"}</span>
                <span>
                  {job.createdAt && new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              {(job.estimatedPrice || job.actualPrice) && (
                <div className="card-meta">
                  {job.estimatedPrice && <span>Est: {Number(job.estimatedPrice).toFixed(2)} MAD</span>}
                  {job.actualPrice && <span>Final: {Number(job.actualPrice).toFixed(2)} MAD</span>}
                </div>
              )}
              <div className="card-meta">
                <span>Payment: {job.paymentStatus || "N/A"}</span>
              </div>
              <div className="row" style={{ marginTop: "4px" }}>
                {job.status === "ACCEPTED" && (
                  <button
                    className="btn primary"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                    onClick={() => completeJob(job.id)}
                  >
                    Mark complete
                  </button>
                )}
                <Link
                  to={`/client/request/${job.id}`}
                  className="btn ghost"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <h4>No jobs found</h4>
              <p className="muted">
                {filter ? "No jobs with this status." : "Accept jobs from the dashboard to see them here."}
              </p>
              <Link to="/professional" className="btn primary">Find jobs</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
