import React, { useState } from "react";
import { apiJson } from "../../api.js";

export default function ProfessionalDashboard() {
  const [filters, setFilters] = useState({ latitude: "", longitude: "", radiusKm: "10" });
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("");

  const updateField = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const loadJobs = async () => {
    setStatus("Loading...");
    try {
      const query = `?lat=${filters.latitude}&lng=${filters.longitude}&radiusKm=${filters.radiusKm}`;
      const data = await apiJson(`/api/requests/available${query}`);
      setJobs(data || []);
      setStatus("");
    } catch (err) {
      setStatus(err.message || "Failed to load nearby requests.");
    }
  };

  const acceptJob = async (jobId) => {
    try {
      await apiJson(`/api/requests/${jobId}/accept`, { method: "PATCH" });
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      setStatus(err.message || "Failed to accept request.");
    }
  };

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Professional dashboard</p>
          <h2>Find nearby requests</h2>
          <p className="muted">Search by location and accept jobs that fit your skills.</p>
        </div>
        <div className="row">
          <button className="btn primary" type="button" onClick={loadJobs}>
            Refresh list
          </button>
          <button className="btn ghost" type="button" onClick={() => setJobs([])}>
            Clear results
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Search filters</h3>
            <p className="muted">Adjust radius to widen or narrow your search.</p>
          </div>
        </div>
        <div className="form-grid form-grid-3">
          <div className="form-row">
            <label>Latitude</label>
            <input value={filters.latitude} onChange={updateField("latitude")} />
          </div>
          <div className="form-row">
            <label>Longitude</label>
            <input value={filters.longitude} onChange={updateField("longitude")} />
          </div>
          <div className="form-row">
            <label>Radius (km)</label>
            <input value={filters.radiusKm} onChange={updateField("radiusKm")} />
          </div>
          <button className="btn primary" type="button" onClick={loadJobs}>
            Load requests
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Nearby requests</h3>
            <p className="muted">Tap accept to claim a job.</p>
          </div>
          <span className="pill">{jobs.length} results</span>
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
              <div className="row">
                <button className="btn primary" type="button" onClick={() => acceptJob(job.id)}>
                  Accept
                </button>
                <button className="btn ghost" type="button">
                  View details
                </button>
              </div>
            </article>
          ))}
          {!status && jobs.length === 0 ? (
            <div className="empty-state">
              <h4>No nearby requests loaded</h4>
              <p className="muted">Enter a location and radius to find jobs.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
