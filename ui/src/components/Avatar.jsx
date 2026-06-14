import React from "react";
import { fileUrl } from "../api.js";

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Round profile picture. Shows the image when `src` (a stored-file path or URL)
 * is present, otherwise falls back to the user's initials.
 */
export default function Avatar({ src, name, size = 40 }) {
  const style = { width: size, height: size };
  if (src) {
    return <img className="avatar" style={style} src={fileUrl(src)} alt={name || "Profile"} />;
  }
  return (
    <span className="avatar avatar-fallback" style={{ ...style, fontSize: size * 0.4 }}>
      {initials(name)}
    </span>
  );
}
