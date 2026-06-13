import React, { useEffect, useState } from "react";
import { apiJson, apiFetch } from "../../api.js";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const loadJobs = (status) => {
    setLoading(true);
    const url = status ? `/api/admin/jobs?status=${status}` : "/api/admin/jobs";
    apiJson(url)
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadJobs(statusFilter), [statusFilter]);

  const forceCancel = async (jobId) => {
    if (!confirm("Force-cancel this job?")) return;
    try {
      await apiFetch(`/api/admin/jobs/${jobId}/cancel`, { method: "PATCH" });
      setActionMsg("Job cancelled by admin");
      loadJobs(statusFilter);
    } catch (err) {
      setActionMsg("Failed: " + err.message);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "REQUESTED": return "#004ac6";
      case "ACCEPTED": return "#855300";
      case "IN_PROGRESS": return "#004ac6";
      case "COMPLETED": return "#166534";
      case "CANCELLED": return "#ba1a1a";
      default: return "#5b6070";
    }
  };

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Job management</p>
          <h2>All Jobs</h2>
          <p className="muted">View and manage all service requests across the platform.</p>
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
            <h3>Jobs</h3>
            <p className="muted">{jobs.length} {statusFilter || "total"}</p>
          </div>
          <div className="row" style={{ gap: "8px" }}>
            {["", "REQUESTED", "ACCEPTED", "COMPLETED", "CANCELLED"].map((s) => (
              <button key={s}
                className={`btn ${statusFilter === s ? 'primary' : 'ghost'}`}
                style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={() => setStatusFilter(s)}>
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading jobs...</p>
        ) : (
          <div className="card-grid">
            {jobs.map((job) => (
              <article className="card-item" key={job.id}>
                <div className="card-head">
                  <strong>{job.title}</strong>
                  <span className="badge" style={{ background: statusColor(job.status) + "20", color: statusColor(job.status) }}>
                    {job.status}
                  </span>
                </div>
                <div className="card-meta">
                  <span>{job.category}</span>
                  <span>Payment: {job.paymentStatus}</span>
                </div>
                <div className="card-meta">
                  <span>Client: {job.clientName}</span>
                  <span>Pro: {job.professionalName}</span>
                </div>
                <div className="card-meta">
                  <span className="small-muted">
                    {job.createdAt ? new Date(job.createdAt).toLocaleString() : ""}
                  </span>
                  {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
                    <button className="btn ghost" style={{ fontSize: "11px", padding: "4px 10px", color: "#dc2626" }}
                      onClick={() => forceCancel(job.id)}>
                      Force cancel
                    </button>
                  )}
                </div>
              </article>
            ))}
            {!loading && jobs.length === 0 && (
              <div className="empty-state">
                <h4>No jobs found</h4>
                <p className="muted">Try changing the filter.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
