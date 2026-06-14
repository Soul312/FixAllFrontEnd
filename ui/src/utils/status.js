// Maps a job/payment status to a status-chip CSS variant class.
export function statusChipClass(status) {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED" || s === "PAID") return "status-chip completed";
  if (s === "ACCEPTED" || s === "IN_PROGRESS") return "status-chip accepted";
  if (s === "CANCELLED" || s === "CANCELED") return "status-chip cancelled";
  return "status-chip open";
}
