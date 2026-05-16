import React, { useState } from "react";
import { apiJson } from "../../api.js";
import MapPicker from "../../components/MapPicker.jsx";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliances",
  "Carpentry",
  "Painting",
  "Cleaning",
  "Roofing",
  "Landscaping",
  "General Repair"
];

export default function NewRequest() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    latitude: "",
    longitude: ""
  });
  const [status, setStatus] = useState("");
  const [geoStatus, setGeoStatus] = useState("");

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    try {
      await apiJson("/api/requests", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude)
        })
      });
      setStatus("Request submitted.");
      setForm({ title: "", description: "", category: "", latitude: "", longitude: "" });
    } catch (err) {
      setStatus(err.message || "Failed to submit request.");
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
            <button className="btn ghost" type="button" onClick={useMyLocation}>
              Use my location
            </button>
            {geoStatus ? <p className="small-muted">{geoStatus}</p> : null}
            {status ? <p className="small-muted">{status}</p> : null}
            <button className="btn primary" type="submit">Submit request</button>
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
              <span>Lat {form.latitude || "--"} · Lng {form.longitude || "--"}</span>
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
