import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiJson, apiFetch, fileUrl } from "../../api.js";
import { OfferRow } from "../../components/Offers.jsx";

const STATUS_STEPS = ["REQUESTED", "ACCEPTED", "COMPLETED"];

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

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [rating, setRating] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelMsg, setCancelMsg] = useState("");

  async function loadJob() {
    const data = await apiJson(`/api/requests/${id}`);
    setJob(data);

    if (data.status === "COMPLETED") {
      try {
        const r = await apiJson(`/api/ratings/job/${id}`);
        setRating(r);
      } catch {
        // No rating yet — that's fine
      }
    }

    // Offers are only relevant while the job is still open for bidding.
    if (data.status === "REQUESTED") {
      try {
        const list = await apiJson(`/api/offers/job/${id}`);
        setOffers(list || []);
      } catch {
        setOffers([]);
      }
    } else {
      setOffers([]);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadJob();
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load job details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const cancelJob = async () => {
    if (!confirm("Are you sure you want to cancel this request?")) return;
    setCancelMsg("");
    try {
      const updated = await apiJson(`/api/requests/${id}/cancel`, { method: "PATCH" });
      setJob(updated);
      setCancelMsg("Request cancelled.");
    } catch (err) {
      setCancelMsg(err.message || "Failed to cancel.");
    }
  };

  if (loading) return <p className="muted">Loading job details...</p>;
  if (error) return <p className="muted">{error}</p>;
  if (!job) return <p className="muted">Job not found.</p>;

  const currentStep = STATUS_STEPS.indexOf(job.status);
  const isCancelled = job.status === "CANCELLED";
  const isCompleted = job.status === "COMPLETED";
  const canPay = (job.status === "ACCEPTED" || job.status === "COMPLETED") && job.paymentStatus !== "PAID";
  const canRate = isCompleted && !rating;
  const canCancel = !isCompleted && !isCancelled;

  return (
    <div className="stack-lg">
      {/* Hero section */}
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Request #{id.substring(0, 8)}</p>
          <h2>{job.title}</h2>
          <p className="muted">{job.description}</p>
        </div>
        <div className="row">
          <span
            className="badge"
            style={{
              background: statusColor(job.status) + "20",
              color: statusColor(job.status),
              fontSize: "14px",
              padding: "6px 14px"
            }}
          >
            {job.status}
          </span>
          {job.paymentStatus && (
            <span className="badge" style={{
              background: job.paymentStatus === "PAID" ? "#ecfdf320" : "#fef3c720",
              color: job.paymentStatus === "PAID" ? "#1f8f4d" : "#d97706"
            }}>
              Payment: {job.paymentStatus}
            </span>
          )}
        </div>
      </section>

      {/* Status timeline */}
      {!isCancelled && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Status timeline</h3>
              <p className="muted">Track the progress of your request.</p>
            </div>
          </div>
          <div className="timeline">
            {STATUS_STEPS.map((step, i) => {
              const isActive = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step} className="timeline-step" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 0",
                  opacity: isActive ? 1 : 0.4
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: isActive ? statusColor(step) : "#e5e7eb",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "14px",
                    boxShadow: isCurrent ? `0 0 0 4px ${statusColor(step)}30` : "none",
                    transition: "all 0.3s ease"
                  }}>
                    {isActive ? "✓" : i + 1}
                  </div>
                  <div>
                    <strong style={{ color: isActive ? statusColor(step) : "#6b7280" }}>{step}</strong>
                    <p className="small-muted" style={{ margin: 0 }}>
                      {step === "REQUESTED" && job.createdAt && new Date(job.createdAt).toLocaleString()}
                      {step === "ACCEPTED" && job.acceptedAt && new Date(job.acceptedAt).toLocaleString()}
                      {step === "COMPLETED" && job.completedAt && new Date(job.completedAt).toLocaleString()}
                      {!isActive && "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isCancelled && (
        <section className="panel" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <h3 style={{ color: "#dc2626", margin: "0 0 6px" }}>Request Cancelled</h3>
          <p className="muted">This request has been cancelled and is no longer active.</p>
        </section>
      )}

      {/* Price offers from professionals (only while the request is open) */}
      {job.status === "REQUESTED" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Price offers</h3>
              <p className="muted">
                Professionals propose a price. Accept one to assign the job, or counter with your own price.
              </p>
            </div>
            <span className="pill">{offers.length}</span>
          </div>
          {offers.length === 0 ? (
            <div className="empty-state">
              <h4>No offers yet</h4>
              <p className="muted">Professionals nearby can see your request and will propose a price.</p>
            </div>
          ) : (
            <div className="card-grid">
              {offers.map((offer) => (
                <OfferRow
                  key={offer.id}
                  offer={offer}
                  viewer="CLIENT"
                  onChanged={() => loadJob()}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Details grid */}
      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Request details</h3>
              <p className="muted">All details about this service request.</p>
            </div>
          </div>
          <div className="card-grid">
            <div className="card-item">
              <div className="card-head">
                <strong>Category</strong>
                <span className="pill">{job.category}</span>
              </div>
            </div>
            <div className="card-item">
              <div className="card-head">
                <strong>Location</strong>
              </div>
              <p className="small-muted">
                Lat {job.latitude?.toFixed(4)} · Lng {job.longitude?.toFixed(4)}
              </p>
            </div>
            {job.estimatedPrice && (
              <div className="card-item">
                <div className="card-head">
                  <strong>Estimated price</strong>
                  <span className="pill">{Number(job.estimatedPrice).toFixed(2)} MAD</span>
                </div>
              </div>
            )}
            {job.actualPrice && (
              <div className="card-item">
                <div className="card-head">
                  <strong>Final price</strong>
                  <span className="pill" style={{ background: "#ecfdf3", color: "#1f8f4d" }}>
                    {Number(job.actualPrice).toFixed(2)} MAD
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel soft-panel">
          <div className="panel-header">
            <div>
              <h3>People</h3>
              <p className="muted">Client and professional involved.</p>
            </div>
          </div>
          <div className="card-grid">
            <div className="card-item">
              <div className="card-head">
                <strong>Client</strong>
                <span className="status-chip">{job.clientName || "You"}</span>
              </div>
            </div>
            {job.professionalName ? (
              <div className="card-item">
                <div className="card-head">
                  <strong>Professional</strong>
                  <span className="status-chip">{job.professionalName}</span>
                </div>
              </div>
            ) : (
              <div className="card-item">
                <div className="card-head">
                  <strong>Professional</strong>
                  <span className="pill pill-muted">Awaiting match</span>
                </div>
              </div>
            )}
          </div>

          {/* Rating display */}
          {rating && (
            <div className="card-item" style={{ marginTop: "12px" }}>
              <div className="card-head">
                <strong>Your rating</strong>
                <span className="pill" style={{ background: "#fef9c3", color: "#a16207" }}>
                  {"★".repeat(rating.score)}{"☆".repeat(5 - rating.score)}
                </span>
              </div>
              {rating.comment && <p className="muted">{rating.comment}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Attached photos */}
      {job.photos && job.photos.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Attached photos</h3>
              <p className="muted">Context images shared by the client.</p>
            </div>
            <span className="pill">{job.photos.length}</span>
          </div>
          <div className="image-thumb-grid">
            {job.photos.map((photo, i) => (
              <a
                className="image-thumb"
                href={fileUrl(photo)}
                target="_blank"
                rel="noreferrer"
                key={i}
              >
                <img src={fileUrl(photo)} alt={`Job photo ${i + 1}`} />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Action buttons */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Actions</h3>
            <p className="muted">Available actions for this request.</p>
          </div>
        </div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          {canPay && (
            <Link to={`/client/request/${id}/pay`} className="btn money">
              Pay now
            </Link>
          )}
          {canRate && (
            <Link to={`/client/request/${id}/rate`} className="btn ghost" style={{ borderColor: "#fbbf24", color: "#a16207" }}>
              Rate service
            </Link>
          )}
          {canCancel && (
            <button className="btn ghost" style={{ color: "#dc2626", borderColor: "#fecaca" }} onClick={cancelJob}>
              Cancel request
            </button>
          )}
          <Link to="/client" className="btn ghost">
            ← Back to dashboard
          </Link>
        </div>
        {cancelMsg && <p className="small-muted" style={{ marginTop: "8px" }}>{cancelMsg}</p>}
      </section>
    </div>
  );
}
