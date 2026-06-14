import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiJson, apiUpload } from "../../api.js";
import { getAuth } from "../../auth.js";
import { CATEGORIES } from "../../constants/categories.js";
import Avatar from "../../components/Avatar.jsx";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ProfileEdit() {
  const navigate = useNavigate();
  const role = getAuth()?.role;
  const isPro = role === "PROFESSIONAL";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const requests = [apiJson("/api/auth/me")];
    if (isPro) requests.push(apiJson("/api/pro/profile"));

    Promise.all(requests)
      .then(([user, profile]) => {
        if (!isMounted) return;
        setFullName(user?.fullName || "");
        setPhone(user?.phone || "");
        setAvatarUrl(user?.avatarUrl || "");
        if (isPro && profile) {
          setBusinessName(profile.businessName || "");
          setBio(profile.bio || "");
          setCategories(profile.categories || []);
        }
        setStatus("");
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus(err.message || "Failed to load profile.");
      });

    return () => {
      isMounted = false;
    };
  }, [isPro]);

  const onPickAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Profile picture must be an image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setStatus("Profile picture must be under 5 MB.");
      return;
    }
    setAvatarBusy(true);
    setStatus("");
    try {
      const data = new FormData();
      data.append("file", file);
      const updated = await apiUpload("/api/auth/me/avatar", data);
      setAvatarUrl(updated?.avatarUrl || "");
      // Tell the app shell to refresh the sidebar avatar.
      window.dispatchEvent(new Event("fixall:user-updated"));
    } catch (err) {
      setStatus(err.message || "Failed to upload profile picture.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      await apiJson("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify({ fullName, phone })
      });

      if (isPro) {
        await apiJson("/api/pro/profile", {
          method: "POST",
          body: JSON.stringify({ businessName, bio, categories })
        });
      }

      navigate("/profile");
    } catch (err) {
      setStatus(err.message || "Profile update failed.");
      setSaving(false);
    }
  };

  return (
    <div className="stack-lg">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Account</p>
          <h2>Edit profile</h2>
          <p className="muted">Update your details and save your changes.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Profile details</h3>
            <p className="muted">Your personal information.</p>
          </div>
        </div>

        {status === "Loading..." ? (
          <p className="muted">Loading...</p>
        ) : (
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Profile picture</label>
              <div className="avatar-editor">
                <Avatar src={avatarUrl} name={fullName} size={72} />
                <div className="stack-sm">
                  <label className="btn ghost" style={{ alignSelf: "flex-start" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>photo_camera</span>
                    {avatarBusy ? "Uploading…" : "Change photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPickAvatar}
                      disabled={avatarBusy}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span className="small-muted">JPG, PNG, WEBP or GIF, up to 5 MB.</span>
                </div>
              </div>
            </div>
            <div className="form-row">
              <label>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            {isPro && (
              <>
                <div className="form-row">
                  <label>Business name</label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Doe Plumbing Services"
                  />
                </div>
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
              </>
            )}

            {status ? <p className="small-muted">{status}</p> : null}
            <div className="row">
              <button className="btn primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              <Link to="/profile" className="btn ghost">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
