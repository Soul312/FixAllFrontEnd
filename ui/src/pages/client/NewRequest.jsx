import React, { useState } from "react";
import { apiJson, apiUpload } from "../../api.js";
import MapPicker from "../../components/MapPicker.jsx";
import { CATEGORIES } from "../../constants/categories.js";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function NewRequest() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    latitude: "",
    longitude: ""
  });
  const [images, setImages] = useState([]); // { file, url } previews
  const [status, setStatus] = useState("");
  const [geoStatus, setGeoStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onPickImages = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = ""; // allow re-picking the same file
    const accepted = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        setStatus({ type: "error", text: `"${file.name}" is not an image.` });
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setStatus({ type: "error", text: `"${file.name}" is larger than 10 MB.` });
        continue;
      }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    setImages((prev) => [...prev, ...accepted]);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index]?.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setSubmitting(true);

    try {
      const job = await apiJson("/api/requests", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude)
        })
      });

      // Upload any attached context images to the freshly created job.
      for (const { file } of images) {
        const data = new FormData();
        data.append("photo", file);
        await apiUpload(`/api/requests/${job.id}/photos`, data);
      }

      setStatus({ type: "success", text: "Request submitted successfully!" });
      setForm({ title: "", description: "", category: "", latitude: "", longitude: "" });
      images.forEach((img) => URL.revokeObjectURL(img.url));
      setImages([]);
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Failed to submit request." });
    } finally {
      setSubmitting(false);
    }
  };

  const applyLocation = ({ lat, lng }) => {
    if (lat == null || lng == null) return;
    setForm((prev) => ({
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

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">New request</p>
          <h2>Share your issue details</h2>
          <p className="muted">Provide a clear description and location so a professional can help fast.</p>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Request details</h3>
              <p className="muted">Add the essentials to match with the right pro.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Title</label>
              <input value={form.title} onChange={updateField("title")} required />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea value={form.description} onChange={updateField("description")} required />
            </div>
            <div className="form-row">
              <label>Category</label>
              <select value={form.category} onChange={updateField("category")} required>
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Photos (optional, max 10 MB each)</label>
              <p className="small-muted" style={{ margin: 0 }}>
                Add pictures of the issue so the professional has context.
              </p>
              <label className="btn ghost" style={{ alignSelf: "flex-start", marginTop: "8px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_photo_alternate</span>
                Add images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickImages}
                  style={{ display: "none" }}
                />
              </label>
              {images.length > 0 && (
                <div className="image-thumb-grid">
                  {images.map((img, i) => (
                    <div className="image-thumb" key={i}>
                      <img src={img.url} alt={`Attachment ${i + 1}`} />
                      <button
                        type="button"
                        className="image-thumb-remove"
                        onClick={() => removeImage(i)}
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn ghost" type="button" onClick={useMyLocation}>
              Use my location
            </button>
            {geoStatus ? <p className="small-muted">{geoStatus}</p> : null}
            {status?.type === "error" && (
              <div className="error-banner">
                <span className="error-banner-icon">!</span>
                <span>{status.text}</span>
              </div>
            )}
            {status?.type === "success" && (
              <div className="success-banner">
                <span className="success-banner-icon">✓</span>
                <span>{status.text}</span>
              </div>
            )}
            <button className="btn primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </div>

        <aside className="panel soft-panel">
          <div className="panel-header">
            <div>
              <h3>Select location</h3>
              <p className="muted">Click the map or search to pick a location.</p>
            </div>
          </div>
          <MapPicker
            value={{ lat: Number(form.latitude), lng: Number(form.longitude) }}
            onChange={applyLocation}
          />
          <div className="card-item">
            <div className="card-head">
              <strong>{form.title || "Request title"}</strong>
              <span className="status-chip">REQUESTED</span>
            </div>
            <p className="muted">{form.description || "Describe the issue in detail."}</p>
            <div className="card-meta">
              <span>{form.category || "Category"}</span>
              <span>Location selected on map</span>
            </div>
          </div>
          <div className="info-card">
            <h4>Tips</h4>
            <ul className="list plain">
              <li>Include the most pressing symptoms.</li>
              <li>Mention preferred visit times.</li>
              <li>Double-check your location coordinates.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
