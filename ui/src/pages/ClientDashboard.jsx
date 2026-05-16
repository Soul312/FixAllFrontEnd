import React, { useEffect, useState } from "react";
import { apiJson } from "../api.js";
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
    <div>
      <div className="card">
        <h2>Client dashboard</h2>
        <p className="small-muted">View your active requests and create a new one.</p>
        <Link to="/client/request/new">
          <button className="secondary">+ New request</button>
        </Link>
      </div>

      <div className="card">
        <h3>Active requests</h3>
        {status ? <p className="small-muted">{status}</p> : null}
        <div className="list">
          {jobs.map((job) => (
            <div className="list-item" key={job.id}>
              <strong>{job.title}</strong>
              <p>{job.description}</p>
              <p className="small-muted">{job.category} · {job.status}</p>
            </div>
          ))}
          {!status && jobs.length === 0 ? <p className="small-muted">No active requests yet.</p> : null}
        </div>
      </div>
    </div>
  );
}

