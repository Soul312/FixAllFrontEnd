import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiJson } from "../../api.js";

export default function RateJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiJson(`/api/requests/${id}`)
      .then((data) => {
        if (!mounted) return;
        setJob(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus(err.message || "Failed to load job.");
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (score < 1) {
      setStatus("Please select a rating (1-5 stars).");
      return;
    }
    setSubmitting(true);
    setStatus("");

    try {
      await apiJson("/api/ratings", {
        method: "POST",
        body: JSON.stringify({
          jobId: id,
          professionalId: job.professionalId,
          score,
          comment: comment.trim() || null
        })
      });
      setStatus("Rating submitted successfully!");
      setTimeout(() => navigate(`/client/request/${id}`), 1500);
    } catch (err) {
      setStatus(err.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="muted">Loading...</p>;

  if (!job || job.status !== "COMPLETED") {
    return (
      <div className="stack-lg">
        <section className="panel" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <h3 style={{ color: "#dc2626" }}>Cannot rate this job</h3>
          <p className="muted">You can only rate completed jobs.</p>
          <Link to="/client" className="btn ghost">← Back to dashboard</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Rate service</p>
          <h2>How was your experience?</h2>
          <p className="muted">
            Rate <strong>{job.professionalName || "the professional"}</strong> for "
            {job.title}".
          </p>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Your rating</h3>
              <p className="muted">Select a score and leave an optional comment.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Score</label>
              <div style={{
                display: "flex",
                gap: "8px",
                padding: "12px 0"
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setScore(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      border: "2px solid",
                      borderColor: star <= (hovered || score) ? "#fbbf24" : "#e5e7eb",
                      background: star <= (hovered || score) ? "#fef9c3" : "#ffffff",
                      fontSize: "22px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      transform: star <= (hovered || score) ? "scale(1.1)" : "scale(1)"
                    }}
                  >
                    {star <= (hovered || score) ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <p className="small-muted">
                {score === 0 && "Click a star to rate"}
                {score === 1 && "Poor"}
                {score === 2 && "Fair"}
                {score === 3 && "Good"}
                {score === 4 && "Very good"}
                {score === 5 && "Excellent"}
              </p>
            </div>
            <div className="form-row">
              <label>Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
              />
            </div>
            {status && <p className="small-muted">{status}</p>}
            <div className="row">
              <button className="btn primary" type="submit" disabled={submitting || score < 1}>
                {submitting ? "Submitting..." : "Submit rating"}
              </button>
              <Link to={`/client/request/${id}`} className="btn ghost">Cancel</Link>
            </div>
          </form>
        </div>

        <aside className="panel soft-panel">
          <div className="panel-header">
            <div>
              <h3>Job summary</h3>
              <p className="muted">The completed service request.</p>
            </div>
          </div>
          <div className="card-item">
            <div className="card-head">
              <strong>{job.title}</strong>
              <span className="status-chip">COMPLETED</span>
            </div>
            <p className="muted">{job.description}</p>
            <div className="card-meta">
              <span>{job.category}</span>
              <span>
                {job.completedAt && new Date(job.completedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="info-card" style={{ marginTop: "12px" }}>
            <h4>Rating tips</h4>
            <ul className="list plain">
              <li>Consider the quality and timeliness of the work.</li>
              <li>Was the professional communicative and polite?</li>
              <li>Would you hire them again?</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
