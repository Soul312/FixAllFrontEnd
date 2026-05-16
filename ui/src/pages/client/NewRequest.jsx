import React, { useState } from "react";
import { apiJson } from "../../api.js";

export default function NewRequest() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    latitude: "",
    longitude: ""
  });
  const [status, setStatus] = useState("");

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

  return (
    <div className="panel">
      <div className="page-header">
        <h2>New request</h2>
        <p className="muted">Share the details so a professional can help quickly.</p>
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
          <input value={form.category} onChange={updateField("category")} required />
        </div>
        <div className="form-row">
          <label>Latitude</label>
          <input value={form.latitude} onChange={updateField("latitude")} required />
        </div>
        <div className="form-row">
          <label>Longitude</label>
          <input value={form.longitude} onChange={updateField("longitude")} required />
        </div>
        {status ? <p className="small-muted">{status}</p> : null}
        <button className="btn primary" type="submit">Submit request</button>
      </form>
    </div>
  );
}

