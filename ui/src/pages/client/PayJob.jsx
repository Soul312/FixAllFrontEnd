import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiJson } from "../../api.js";

export default function PayJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [step, setStep] = useState("form"); // form | processing | success
  const [intentData, setIntentData] = useState(null);

  useEffect(() => {
    let mounted = true;
    apiJson(`/api/requests/${id}`)
      .then((data) => {
        if (!mounted) return;
        setJob(data);
        // Pre-fill amount from actual or estimated price
        const price = data.actualPrice || data.estimatedPrice;
        if (price) {
          setAmount(String(Math.round(Number(price) * 100)));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus(err.message || "Failed to load job.");
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const createPaymentIntent = async (event) => {
    event.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setStatus("Please enter a valid amount.");
      return;
    }
    setStatus("");
    setStep("processing");

    try {
      const data = await apiJson("/api/payments/create-intent", {
        method: "POST",
        body: JSON.stringify({
          jobId: id,
          amountCents: Number(amount)
        })
      });
      setIntentData(data);
      // In a real app, you'd use Stripe.js with the clientSecret here.
      // For now, we auto-confirm since we don't have Stripe.js loaded.
      await apiJson("/api/payments/confirm", {
        method: "POST",
        body: JSON.stringify({
          paymentIntentId: data.paymentIntentId
        })
      });
      setStep("success");
    } catch (err) {
      setStatus(err.message || "Payment failed.");
      setStep("form");
    }
  };

  if (loading) return <p className="muted">Loading...</p>;

  if (!job) {
    return (
      <div className="stack-lg">
        <section className="panel" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <h3 style={{ color: "#dc2626" }}>Job not found</h3>
          <Link to="/client" className="btn ghost">← Back to dashboard</Link>
        </section>
      </div>
    );
  }

  if (job.paymentStatus === "PAID") {
    return (
      <div className="stack-lg">
        <section className="panel" style={{ background: "#ecfdf3", border: "1px solid #1f8f4d" }}>
          <h3 style={{ color: "#1f8f4d" }}>Already paid</h3>
          <p className="muted">This job has already been paid for.</p>
          <Link to={`/client/request/${id}`} className="btn ghost">← View job details</Link>
        </section>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="stack-lg">
        <section className="panel" style={{
          background: "linear-gradient(135deg, #ecfdf3, #f0fdf4)",
          border: "1px solid #1f8f4d",
          textAlign: "center",
          padding: "40px"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#1f8f4d",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 16px"
          }}>✓</div>
          <h2 style={{ color: "#1f8f4d", margin: "0 0 8px" }}>Payment Successful</h2>
          <p className="muted">
            {(Number(amount) / 100).toFixed(2)} MAD has been charged for "{job.title}".
          </p>
          {intentData && (
            <p className="small-muted">
              Payment ID: {intentData.paymentIntentId}
            </p>
          )}
          <div className="row" style={{ justifyContent: "center", marginTop: "16px" }}>
            <Link to={`/client/request/${id}`} className="btn primary">View job</Link>
            <Link to="/client" className="btn ghost">Dashboard</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Payment</p>
          <h2>Pay for your service</h2>
          <p className="muted">
            Complete payment for "{job.title}" to finalize the transaction.
          </p>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Payment details</h3>
              <p className="muted">Enter the payment amount in centimes.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createPaymentIntent}>
            <div className="card-item" style={{ background: "#f8fafc" }}>
              <div className="card-head">
                <strong>Amount to pay</strong>
                <span className="pill" style={{ fontSize: "16px", padding: "8px 16px" }}>
                  {amount ? `${(Number(amount) / 100).toFixed(2)} MAD` : "0.00 MAD"}
                </span>
              </div>
            </div>
            <div className="form-row">
              <label>Amount (centimes)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                required
                placeholder="e.g. 5000 = 50.00 MAD"
              />
              <p className="small-muted">1 MAD = 100 centimes</p>
            </div>
            {status && <p className="small-muted" style={{ color: "#dc2626" }}>{status}</p>}
            <div className="row">
              <button
                className="btn primary"
                type="submit"
                disabled={step === "processing"}
              >
                {step === "processing" ? "Processing..." : "Pay now"}
              </button>
              <Link to={`/client/request/${id}`} className="btn ghost">Cancel</Link>
            </div>
          </form>
        </div>

        <aside className="panel soft-panel">
          <div className="panel-header">
            <div>
              <h3>Order summary</h3>
              <p className="muted">Review before payment.</p>
            </div>
          </div>
          <div className="card-item">
            <div className="card-head">
              <strong>{job.title}</strong>
              <span className="status-chip">{job.status}</span>
            </div>
            <p className="muted">{job.description}</p>
            <div className="card-meta">
              <span>{job.category}</span>
              <span>Pro: {job.professionalName || "N/A"}</span>
            </div>
          </div>
          {job.estimatedPrice && (
            <div className="card-item" style={{ marginTop: "12px" }}>
              <div className="card-head">
                <strong>Estimated</strong>
                <span className="pill pill-muted">{Number(job.estimatedPrice).toFixed(2)} MAD</span>
              </div>
            </div>
          )}
          {job.actualPrice && (
            <div className="card-item" style={{ marginTop: "8px" }}>
              <div className="card-head">
                <strong>Final price</strong>
                <span className="pill" style={{ background: "#ecfdf3", color: "#1f8f4d" }}>
                  {Number(job.actualPrice).toFixed(2)} MAD
                </span>
              </div>
            </div>
          )}
          <div className="info-card" style={{ marginTop: "12px" }}>
            <h4>Secure payments</h4>
            <ul className="list plain">
              <li>Payments are processed securely via Stripe.</li>
              <li>Your card details are never stored on our servers.</li>
              <li>Funds are released to the professional upon confirmation.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
