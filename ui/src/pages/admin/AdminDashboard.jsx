import React, { useEffect, useState } from "react";
import { apiJson } from "../../api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson("/api/admin/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading dashboard...</p>;
  if (!stats) return <p className="muted">Failed to load admin stats. Are you logged in as admin?</p>;

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Admin dashboard</p>
          <h2>Platform Overview</h2>
          <p className="muted">Manage users, jobs, and verifications from one place.</p>
        </div>
      </section>

      <section className="grid-3">
        <div className="stat-card">
          <h4>Total Users</h4>
          <strong>{stats.totalUsers}</strong>
          <p className="small-muted">{stats.totalClients} clients · {stats.totalPros} professionals</p>
        </div>
        <div className="stat-card">
          <h4>Pending Verifications</h4>
          <strong style={{color: stats.pendingVerifications > 0 ? '#dc2626' : '#1f8f4d'}}>
            {stats.pendingVerifications}
          </strong>
          <p className="small-muted">Professionals awaiting review</p>
        </div>
        <div className="stat-card">
          <h4>Total Jobs</h4>
          <strong>{stats.totalJobs}</strong>
          <p className="small-muted">{stats.openJobs} open · {stats.activeJobs} active · {stats.completedJobs} done</p>
        </div>
      </section>
    </div>
  );
}
