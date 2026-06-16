import React, { useState } from "react";
import { apiJson } from "../api.js";

function offerChipClass(status) {
  switch (String(status || "").toUpperCase()) {
    case "ACCEPTED": return "status-chip completed";
    case "DECLINED": return "status-chip cancelled";
    case "AWAITING_PRO": return "status-chip accepted";
    default: return "status-chip open"; // AWAITING_CLIENT
  }
}

function offerLabel(status) {
  switch (String(status || "").toUpperCase()) {
    case "AWAITING_CLIENT": return "Awaiting client";
    case "AWAITING_PRO": return "Awaiting pro";
    case "ACCEPTED": return "Accepted";
    case "DECLINED": return "Declined";
    default: return status;
  }
}

/** Inline form for a professional to propose (or update) a price on a job. */
export function MakeOfferForm({ jobId, existingAmount, onSubmitted }) {
  const [amount, setAmount] = useState(existingAmount ? String(existingAmount) : "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) { setErr("Enter a valid amount."); return; }
    setBusy(true); setErr("");
    try {
      await apiJson("/api/offers", {
        method: "POST",
        body: JSON.stringify({ jobId, amount: value })
      });
      onSubmitted?.();
    } catch (e) {
      setErr(e.message || "Failed to send offer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack-sm" style={{ width: "100%" }}>
      <div className="row" style={{ gap: "8px" }}>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Your price (MAD)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn money" type="button" disabled={busy} onClick={submit}>
          {existingAmount ? "Update offer" : "Make offer"}
        </button>
      </div>
      {err && <span className="small-muted" style={{ color: "var(--error)" }}>{err}</span>}
    </div>
  );
}

/**
 * A single offer with negotiation controls.
 * viewer: "CLIENT" or "PRO". The acting party is whoever `awaitingParty` points to.
 */
export function OfferRow({ offer, viewer, onChanged }) {
  const [showCounter, setShowCounter] = useState(false);
  const [counter, setCounter] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const myTurn = offer.awaitingParty === viewer;
  const closed = offer.status === "ACCEPTED" || offer.status === "DECLINED";

  const act = async (path, body) => {
    setBusy(true); setErr("");
    try {
      await apiJson(`/api/offers/${offer.id}/${path}`, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined
      });
      setShowCounter(false);
      setCounter("");
      onChanged?.();
    } catch (e) {
      setErr(e.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const submitCounter = () => {
    const value = Number(counter);
    if (!value || value <= 0) { setErr("Enter a valid amount."); return; }
    act("counter", { amount: value });
  };

  // The headline differs by viewer: the client sees which pro; the pro sees which job.
  const headline = viewer === "CLIENT" ? offer.professionalName : offer.jobTitle;

  return (
    <article className="card-item">
      <div className="card-head">
        <div className="stack-sm">
          <strong>{headline}</strong>
          <span className="small-muted">{Number(offer.amount).toFixed(2)} MAD</span>
        </div>
        <span className={offerChipClass(offer.status)}>{offerLabel(offer.status)}</span>
      </div>

      {!closed && myTurn && !showCounter && (
        <div className="row" style={{ flexWrap: "wrap", gap: "8px" }}>
          <button className="btn money" type="button" disabled={busy} onClick={() => act("accept")}>
            Accept {Number(offer.amount).toFixed(0)} MAD
          </button>
          <button className="btn ghost" type="button" disabled={busy} onClick={() => setShowCounter(true)}>
            Counter
          </button>
          <button
            className="btn ghost"
            type="button"
            disabled={busy}
            style={{ color: "var(--error)", borderColor: "var(--error-border)" }}
            onClick={() => act("decline")}
          >
            Decline
          </button>
        </div>
      )}

      {!closed && myTurn && showCounter && (
        <div className="row" style={{ gap: "8px" }}>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Counter amount (MAD)"
            value={counter}
            onChange={(e) => setCounter(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn primary" type="button" disabled={busy} onClick={submitCounter}>
            Send
          </button>
          <button className="btn ghost" type="button" disabled={busy} onClick={() => setShowCounter(false)}>
            Cancel
          </button>
        </div>
      )}

      {!closed && !myTurn && (
        <p className="small-muted">
          Waiting for the {offer.awaitingParty === "CLIENT" ? "client" : "professional"} to respond.
        </p>
      )}

      {err && <p className="small-muted" style={{ color: "var(--error)", margin: 0 }}>{err}</p>}
    </article>
  );
}
