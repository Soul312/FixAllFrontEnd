import React, { useEffect, useState } from "react";
import { apiJson } from "../../api.js";

export default function ProEarnings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    apiJson("/api/requests/my")
      .then((data) => {
        if (!mounted) return;
        setJobs(data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load earnings.");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const completedJobs = jobs.filter((j) => j.status === "COMPLETED");
  const paidJobs = completedJobs.filter((j) => j.paymentStatus === "PAID");
  const pendingPaymentJobs = completedJobs.filter((j) => j.paymentStatus !== "PAID");

  const totalEarned = paidJobs.reduce((sum, j) => {
    const price = j.actualPrice || j.estimatedPrice || 0;
    return sum + Number(price);
  }, 0);

  const pendingAmount = pendingPaymentJobs.reduce((sum, j) => {
    const price = j.actualPrice || j.estimatedPrice || 0;
    return sum + Number(price);
  }, 0);

  const avgPerJob = paidJobs.length > 0 ? totalEarned / paidJobs.length : 0;

  // Group by month
  const monthlyData = {};
  paidJobs.forEach((j) => {
    const date = j.completedAt ? new Date(j.completedAt) : new Date(j.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!monthlyData[key]) {
      monthlyData[key] = { label, total: 0, count: 0 };
    }
    monthlyData[key].total += Number(j.actualPrice || j.estimatedPrice || 0);
    monthlyData[key].count += 1;
  });

  const months = Object.keys(monthlyData).sort().reverse();

  if (loading) return <p className="muted">Loading earnings...</p>;

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Earnings</p>
          <h2>Your revenue overview</h2>
          <p className="muted">Track your earnings from completed and paid jobs.</p>
        </div>
      </section>

      {error && <p className="muted">{error}</p>}

      <section className="grid-3">
        <div className="stat-card">
          <h4>Total earned</h4>
          <strong style={{ color: "#1f8f4d" }}>{totalEarned.toFixed(2)} MAD</strong>
          <p className="small-muted">{paidJobs.length} paid jobs</p>
        </div>
        <div className="stat-card">
          <h4>Pending payment</h4>
          <strong style={{ color: "#d97706" }}>{pendingAmount.toFixed(2)} MAD</strong>
          <p className="small-muted">{pendingPaymentJobs.length} awaiting payment</p>
        </div>
        <div className="stat-card">
          <h4>Avg per job</h4>
          <strong>{avgPerJob.toFixed(2)} MAD</strong>
          <p className="small-muted">Average earnings per paid job</p>
        </div>
      </section>

      {/* Earnings bar chart visualization */}
      {months.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Monthly breakdown</h3>
              <p className="muted">Earnings per month from paid jobs.</p>
            </div>
          </div>
          <div className="card-grid">
            {months.map((key) => {
              const m = monthlyData[key];
              const maxTotal = Math.max(...months.map((k) => monthlyData[k].total), 1);
              const pct = (m.total / maxTotal) * 100;
              return (
                <div className="card-item" key={key}>
                  <div className="card-head">
                    <strong>{m.label}</strong>
                    <span className="pill" style={{ background: "#ecfdf3", color: "#1f8f4d" }}>
                      {m.total.toFixed(2)} MAD
                    </span>
                  </div>
                  <div style={{
                    height: "8px",
                    borderRadius: "999px",
                    background: "#e5e7eb",
                    overflow: "hidden",
                    marginTop: "8px"
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg, #1f8f4d, #1b5fa7)",
                      transition: "width 0.6s ease"
                    }} />
                  </div>
                  <p className="small-muted" style={{ marginTop: "4px" }}>
                    {m.count} job{m.count !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent paid jobs */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Recent paid jobs</h3>
            <p className="muted">Jobs that have been completed and paid.</p>
          </div>
          <span className="pill">{paidJobs.length} paid</span>
        </div>
        <div className="card-grid">
          {paidJobs.slice(0, 10).map((job) => (
            <article className="card-item" key={job.id}>
              <div className="card-head">
                <div className="stack-sm">
                  <strong>{job.title}</strong>
                  <span className="small-muted">{job.category}</span>
                </div>
                <span className="pill" style={{ background: "#ecfdf3", color: "#1f8f4d" }}>
                  {Number(job.actualPrice || job.estimatedPrice || 0).toFixed(2)} MAD
                </span>
              </div>
              <div className="card-meta">
                <span>Client: {job.clientName || "N/A"}</span>
                <span>
                  {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : ""}
                </span>
              </div>
            </article>
          ))}
          {paidJobs.length === 0 && (
            <div className="empty-state">
              <h4>No earnings yet</h4>
              <p className="muted">Complete and get paid for jobs to see your earnings here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
