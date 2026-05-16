import React, { useState } from "react";
import { apiJson } from "../api.js";

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
      <div className="panel">
        <div className="page-header">
          <h2>Professional dashboard</h2>
          <p className="muted">Find nearby requests and accept jobs.</p>
        </div>
        <div className="form-grid">
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
      </div>

      <div className="panel">
        <div className="page-header">
          <h3>Nearby requests</h3>
          {status ? <p className="small-muted">{status}</p> : null}
        </div>
        <div className="list">
          {jobs.map((job) => (
            <div className="list-item" key={job.id}>
              <strong>{job.title}</strong>
              <p>{job.description}</p>
              <p className="small-muted">{job.category} · {job.status}</p>
              <button className="btn primary" type="button" onClick={() => acceptJob(job.id)}>
                Accept
              </button>
            </div>
          ))}
          {!status && jobs.length === 0 ? <p className="small-muted">No nearby requests loaded.</p> : null}
        </div>
      </div>
    </div>
  );
}
