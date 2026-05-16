import React, { useEffect, useRef, useState } from "react";

const DEFAULT_CENTER = { lat: 33.0198, lng: -96.6989 };

function loadGoogleMaps(key) {
  if (window.google?.maps) {
    return Promise.resolve();
  }
  if (!key) {
    return Promise.reject(new Error("Missing Google Maps API key"));
  }
  if (window.__fixallMapsPromise) {
    return window.__fixallMapsPromise;
  }

  window.__fixallMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return window.__fixallMapsPromise;
}

export default function MapPicker({ value, onChange }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchRef = useRef(null);
  const [mapError, setMapError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
      setMapError("Google Maps API key is missing.");
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    loadGoogleMaps(import.meta.env.VITE_GOOGLE_MAPS_KEY)
      .then(() => {
        if (!isMounted || mapInstanceRef.current) return;
        setIsLoading(false);
        const start = value?.lat && value?.lng ? value : DEFAULT_CENTER;
        const map = new window.google.maps.Map(mapRef.current, {
          center: start,
          zoom: value?.lat ? 12 : 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        mapInstanceRef.current = map;
        markerRef.current = new window.google.maps.Marker({
          position: start,
          map
        });

        map.addListener("click", (event) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          markerRef.current.setPosition({ lat, lng });
          onChange({ lat, lng });
        });

        if (searchRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(searchRef.current, {
            fields: ["geometry", "name"]
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const location = place?.geometry?.location;
            if (!location) return;
            const lat = location.lat();
            const lng = location.lng();
            map.panTo({ lat, lng });
            map.setZoom(13);
            markerRef.current.setPosition({ lat, lng });
            onChange({ lat, lng });
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setMapError(err.message || "Map failed to load.");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !value?.lat || !value?.lng) return;
    const next = { lat: Number(value.lat), lng: Number(value.lng) };
    if (Number.isNaN(next.lat) || Number.isNaN(next.lng)) return;
    mapInstanceRef.current.panTo(next);
    markerRef.current?.setPosition(next);
  }, [value]);

  return (
    <div className="map-panel">
      <div className="map-controls">
        <input
          ref={searchRef}
          className="map-search"
          placeholder="Search a place"
          type="text"
          disabled={Boolean(mapError) || isLoading}
        />
        {isLoading ? <span className="small-muted">Loading map...</span> : null}
        {mapError ? <span className="small-muted">{mapError}</span> : null}
      </div>
      <div className={mapError ? "map-canvas map-disabled" : "map-canvas"} ref={mapRef} />
      {mapError ? (
        <div className="map-overlay">
          <p className="muted">Set `VITE_GOOGLE_MAPS_KEY` in `ui/.env` and restart the UI build.</p>
        </div>
      ) : null}
    </div>
  );
}
