import React, { useState } from "react";
import { apiJson } from "../../api.js";
import MapPicker from "../../components/MapPicker.jsx";
import { Link } from "react-router-dom";
import { statusChipClass } from "../../utils/status.js";

export default function ProfessionalDashboard() {
  const [filters, setFilters] = useState({ latitude: "", longitude: "", radiusKm: "10" });
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("");
  const [geoStatus, setGeoStatus] = useState("");

  const updateField = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const applyLocation = ({ lat, lng }) => {
    if (lat == null || lng == null) return;
    setFilters((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported on this device.");
      return;
    }
    setGeoStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("");
      },
      () => setGeoStatus("Unable to access your location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
          <p className="eyebrow">Professional jobs</p>
          <h2>Claim nearby requests</h2>
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
          <div className="row">
            <span className="pill">Available</span>
            <span className="pill pill-muted">Accepted</span>
            <span className="pill pill-muted">Completed</span>
          </div>
        </div>
        <div className="form-grid form-grid-3">
          <div className="form-row">
            <label>Radius (km)</label>
            <input value={filters.radiusKm} onChange={updateField("radiusKm")} />
          </div>
          <button className="btn ghost" type="button" onClick={useMyLocation}>
            Use my location
          </button>
          <button className="btn primary" type="button" onClick={loadJobs}>
            Load requests
          </button>
        </div>
        {geoStatus ? <p className="small-muted">{geoStatus}</p> : null}
      </section>

      <section className="panel soft-panel">
        <div className="panel-header">
          <div>
            <h3>Select search location</h3>
            <p className="muted">Click the map or search to set your search center.</p>
          </div>
        </div>
        <MapPicker
          value={{ lat: Number(filters.latitude), lng: Number(filters.longitude) }}
          onChange={applyLocation}
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Nearby requests</h3>
            <p className="muted">Tap accept to claim a job.</p>
          </div>
          <span className="pill">{jobs.length} results</span>
        </div>
        {status && status !== "Loading..." && (
          <div className="error-banner">
            <span className="error-banner-icon">!</span>
            <span>{status}</span>
          </div>
        )}
        {status === "Loading..." && <p className="muted">Loading...</p>}
        <div className="card-grid">
          {jobs.map((job) => (
            <article className="card-item" key={job.id}>
              <div className="card-head">
                <div className="stack-sm">
                  <strong>{job.title}</strong>
                  <span className="small-muted">{job.category}</span>
                </div>
                <span className={statusChipClass(job.status)}>{job.status}</span>
              </div>
              <p className="muted">{job.description}</p>
              <div className="card-meta">
                <span>Lat {job.latitude} · Lng {job.longitude}</span>
                <span>Posted today</span>
              </div>
              <div className="row">
                <button className="btn primary" type="button" onClick={() => acceptJob(job.id)}>
                  Accept
                </button>
                <Link to={`/client/request/${job.id}`} className="btn ghost">
                  View details
                </Link>
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
