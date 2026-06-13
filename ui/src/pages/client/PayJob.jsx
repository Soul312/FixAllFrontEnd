import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiJson } from "../../api.js";
import { statusChipClass } from "../../utils/status.js";

/* ─── Inner checkout form (rendered inside <Elements>) ─────────────── */
function CheckoutForm({ job, intentData, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    try {
      // Confirm the payment client-side with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // fallback for redirect-based methods
        },
        redirect: "if_required", // don't redirect for card payments
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.");
        setProcessing(false);
        return;
      }

      // Payment succeeded client-side — confirm with our backend
      if (paymentIntent && paymentIntent.status === "succeeded") {
        try {
          await apiJson("/api/payments/confirm", {
            method: "POST",
            body: JSON.stringify({
              jobId: job.id,
              paymentIntentId: paymentIntent.id,
            }),
          });
        } catch (backendErr) {
          // Payment went through with Stripe but backend confirm failed
          // This is recoverable — the payment is still valid
          console.warn("Backend confirm failed, but Stripe payment succeeded:", backendErr);
        }
        onSuccess(paymentIntent);
      } else {
        setError("Payment was not completed. Status: " + (paymentIntent?.status || "unknown"));
        setProcessing(false);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-checkout-form">
      <div className="stripe-element-container">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="stripe-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5" />
            <path d="M8 4.5V8.5M8 10.5V11" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        className="btn money full stripe-pay-btn"
        type="submit"
        disabled={!stripe || processing}
      >
        {processing ? (
          <span className="stripe-spinner-row">
            <span className="stripe-spinner" />
            Processing payment…
          </span>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Pay {intentData ? `${(intentData.amountCents / 100).toFixed(2)} MAD` : "now"}
          </>
        )}
      </button>
    </form>
  );
}

/* ─── Main PayJob page ─────────────────────────────────────────────── */
export default function PayJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stripe state
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [intentData, setIntentData] = useState(null);
  const [step, setStep] = useState("loading"); // loading | form | success
  const [successIntent, setSuccessIntent] = useState(null);

  // 1. Load job + Stripe config in parallel
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const [jobData, config] = await Promise.all([
          apiJson(`/api/requests/${id}`),
          apiJson("/api/payments/config"),
        ]);

        if (!mounted) return;

        setJob(jobData);

        // Already paid?
        if (jobData.paymentStatus === "PAID") {
          setStep("already-paid");
          setLoading(false);
          return;
        }

        // Not in a payable state?
        if (jobData.status !== "ACCEPTED" && jobData.status !== "COMPLETED") {
          setError("This job is not ready for payment yet. A professional must accept it first.");
          setLoading(false);
          return;
        }

        // Initialize Stripe
        const stripe = loadStripe(config.publishableKey);
        setStripePromise(stripe);

        // Create PaymentIntent
        const amount = jobData.actualPrice || jobData.estimatedPrice;
        const amountCents = amount ? Math.round(Number(amount) * 100) : 5000; // fallback

        const intent = await apiJson("/api/payments/create-intent", {
          method: "POST",
          body: JSON.stringify({
            jobId: id,
            amountCents,
          }),
        });

        if (!mounted) return;

        setIntentData(intent);
        setClientSecret(intent.clientSecret);
        setStep("form");
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to initialize payment.");
        setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, [id]);

  const handleSuccess = useCallback((paymentIntent) => {
    setSuccessIntent(paymentIntent);
    setStep("success");
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="stack-lg">
        <section className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="stripe-loading-pulse" />
          <p className="muted" style={{ marginTop: "16px" }}>Setting up secure payment…</p>
        </section>
      </div>
    );
  }

  // ── Error state ──
  if (error && !job) {
    return (
      <div className="stack-lg">
        <section className="panel" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <h3 style={{ color: "#dc2626" }}>Payment Error</h3>
          <p className="muted">{error}</p>
          <Link to="/client" className="btn ghost">← Back to dashboard</Link>
        </section>
      </div>
    );
  }

  // ── Already paid ──
  if (step === "already-paid") {
    return (
      <div className="stack-lg">
        <section className="panel" style={{
          background: "linear-gradient(135deg, #ecfdf3, #f0fdf4)",
          border: "1px solid #1f8f4d",
          textAlign: "center",
          padding: "48px 20px"
        }}>
          <div className="stripe-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1f8f4d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ color: "#1f8f4d", margin: "16px 0 8px" }}>Already Paid</h2>
          <p className="muted">This job has already been paid for successfully.</p>
          <div className="row" style={{ justifyContent: "center", marginTop: "20px" }}>
            <Link to={`/client/request/${id}`} className="btn primary">View job details</Link>
            <Link to="/client" className="btn ghost">Dashboard</Link>
          </div>
        </section>
      </div>
    );
  }

  // ── Success state ──
  if (step === "success") {
    return (
      <div className="stack-lg">
        <section className="panel stripe-success-panel">
          <div className="stripe-success-animation">
            <div className="stripe-success-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <h2 className="stripe-success-title">Payment Successful!</h2>
          <p className="muted" style={{ textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
            {intentData && `${(intentData.amountCents / 100).toFixed(2)} MAD`} has been charged for "{job?.title}".
            The professional has been notified.
          </p>
          {successIntent && (
            <div className="stripe-receipt-card">
              <div className="stripe-receipt-row">
                <span className="muted">Payment ID</span>
                <span className="small-muted" style={{ fontFamily: "monospace" }}>
                  {successIntent.id?.substring(0, 24)}…
                </span>
              </div>
              <div className="stripe-receipt-row">
                <span className="muted">Status</span>
                <span className="stripe-status-badge stripe-status-success">Confirmed</span>
              </div>
              <div className="stripe-receipt-row">
                <span className="muted">Amount</span>
                <strong>{intentData ? `${(intentData.amountCents / 100).toFixed(2)} MAD` : "—"}</strong>
              </div>
            </div>
          )}
          <div className="row" style={{ justifyContent: "center", marginTop: "8px" }}>
            <Link to={`/client/request/${id}`} className="btn primary">View job</Link>
            <Link to="/client" className="btn ghost">Dashboard</Link>
          </div>
        </section>
      </div>
    );
  }

  // ── Payment form with Stripe Elements ──
  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Secure Payment</p>
          <h2>Complete your payment</h2>
          <p className="muted">
            Pay for "{job?.title}" to confirm the service with your professional.
          </p>
        </div>
      </section>

      {error && (
        <section className="panel" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>
        </section>
      )}

      <section className="grid-2">
        {/* Stripe Payment Form */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Payment method</h3>
              <p className="muted">Enter your card details below.</p>
            </div>
            <div className="stripe-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Secured by Stripe</span>
            </div>
          </div>

          {stripePromise && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#1f8f4d",
                    colorBackground: "#ffffff",
                    colorText: "#0f172a",
                    colorDanger: "#dc2626",
                    fontFamily: '"Segoe UI", Arial, sans-serif',
                    borderRadius: "10px",
                    spacingUnit: "4px",
                  },
                  rules: {
                    ".Input": {
                      border: "1px solid #d1d5db",
                      boxShadow: "none",
                      padding: "10px 12px",
                    },
                    ".Input:focus": {
                      border: "1px solid #1f8f4d",
                      boxShadow: "0 0 0 3px rgba(31, 143, 77, 0.15)",
                    },
                    ".Label": {
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "6px",
                    },
                  },
                },
              }}
            >
              <CheckoutForm
                job={job}
                intentData={intentData}
                onSuccess={handleSuccess}
              />
            </Elements>
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div className="stripe-loading-pulse" />
              <p className="muted" style={{ marginTop: "12px" }}>Loading payment form…</p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="panel soft-panel">
          <div className="panel-header">
            <div>
              <h3>Order summary</h3>
              <p className="muted">Review before payment.</p>
            </div>
          </div>

          <div className="card-item">
            <div className="card-head">
              <strong>{job?.title}</strong>
              <span className={statusChipClass(job?.status)}>{job?.status}</span>
            </div>
            <p className="muted">{job?.description}</p>
            <div className="card-meta">
              <span>{job?.category}</span>
              <span>Pro: {job?.professionalName || "N/A"}</span>
            </div>
          </div>

          {job?.estimatedPrice && (
            <div className="card-item" style={{ marginTop: "12px" }}>
              <div className="card-head">
                <strong>Estimated</strong>
                <span className="pill pill-muted">{Number(job.estimatedPrice).toFixed(2)} MAD</span>
              </div>
            </div>
          )}

          {intentData && (
            <div className="card-item" style={{ marginTop: "8px" }}>
              <div className="card-head">
                <strong>Amount to pay</strong>
                <span className="pill" style={{ background: "#ecfdf3", color: "#1f8f4d", fontSize: "16px", padding: "8px 16px" }}>
                  {(intentData.amountCents / 100).toFixed(2)} MAD
                </span>
              </div>
            </div>
          )}

          <div className="info-card" style={{ marginTop: "16px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "14px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f8f4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: "6px" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secure payment
            </h4>
            <ul className="list plain">
              <li>Payments are processed securely via Stripe.</li>
              <li>Your card details are never stored on our servers.</li>
              <li>Funds are released to the professional upon confirmation.</li>
              <li>256-bit SSL encryption protects your data.</li>
            </ul>
          </div>

          <Link
            to={`/client/request/${id}`}
            className="btn ghost full"
            style={{ marginTop: "12px" }}
          >
            ← Cancel and go back
          </Link>
        </aside>
      </section>
    </div>
  );
}
