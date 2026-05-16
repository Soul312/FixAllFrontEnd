import React, { useState } from "react";
import { apiJson } from "../../api.js";

export default function Profile() {
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    try {
      await apiJson("/api/pro/profile", {
        method: "POST",
        body: JSON.stringify({
          bio,
          categories: categories.split(",").map((cat) => cat.trim()).filter(Boolean)
        })
      });
      setStatus("Profile updated.");
    } catch (err) {
      setStatus(err.message || "Profile update failed.");
    }
  };

  return (
    <div className="panel">
      <div className="page-header">
        <h2>Professional profile</h2>
        <p className="muted">Update your bio and job categories.</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Categories (comma-separated)</label>
          <input value={categories} onChange={(e) => setCategories(e.target.value)} />
        </div>
        {status ? <p className="small-muted">{status}</p> : null}
        <button className="btn primary" type="submit">Save profile</button>
      </form>
    </div>
  );
}

