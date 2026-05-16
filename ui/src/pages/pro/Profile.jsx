import React, { useState } from "react";
import { apiJson } from "../../api.js";
import { CATEGORIES } from "../../constants/categories.js";

export default function Profile() {
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    try {
      await apiJson("/api/pro/profile", {
        method: "POST",
        body: JSON.stringify({
          bio,
          categories
        })
      });
      setStatus("Profile updated.");
    } catch (err) {
      setStatus(err.message || "Profile update failed.");
    }
  };

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Professional profile</p>
          <h2>Show clients what you do best</h2>
          <p className="muted">Keep your bio and categories up to date to win more jobs.</p>
        </div>
      </section>

      <section className="grid-3">
        <div className="stat-card">
          <h4>Profile strength</h4>
          <strong>{bio ? "90%" : "45%"}</strong>
          <p className="small-muted">Add details to improve visibility</p>
        </div>
        <div className="stat-card">
          <h4>Categories</h4>
          <strong>{categories.length}</strong>
          <p className="small-muted">Services you offer</p>
        </div>
        <div className="stat-card">
          <h4>Response rate</h4>
          <strong>Fast</strong>
          <p className="small-muted">Based on recent activity</p>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Profile details</h3>
              <p className="muted">Tell clients about your experience and specialties.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Categories (select all that apply)</label>
              <div className="chip-grid">
                {CATEGORIES.map((category) => (
                  <label className="chip" key={category}>
                    <input
                      type="checkbox"
                      checked={categories.includes(category)}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setCategories((prev) =>
                          checked ? [...prev, category] : prev.filter((item) => item !== category)
                        );
                      }}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
            {status ? <p className="small-muted">{status}</p> : null}
            <button className="btn primary" type="submit">Save profile</button>
          </form>
        </div>

        <aside className="panel soft-panel">
          <div className="panel-header">
            <div>
              <h3>Preview</h3>
              <p className="muted">How your profile appears to clients.</p>
            </div>
          </div>
          <div className="card-item">
            <div className="card-head">
              <strong>Professional profile</strong>
              <span className="status-chip">Active</span>
            </div>
            <p className="muted">{bio || "Add a short bio to introduce your services."}</p>
            <div className="card-meta">
              <span>{categories.length ? categories.join(", ") : "Categories not set"}</span>
              <span>Available now</span>
            </div>
          </div>
          <div className="info-card">
            <h4>Tips</h4>
            <ul className="list plain">
              <li>Keep your bio concise and friendly.</li>
              <li>List your top 3 specialties first.</li>
              <li>Update categories as you expand services.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
