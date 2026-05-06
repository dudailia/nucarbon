import { ImageResponse } from "next/og";

export const alt = "NUCarbon — Northeastern AI Carbon Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a1a0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div
            style={{
              width: 72, height: 72,
              background: "rgba(34,197,94,0.15)",
              border: "1.5px solid rgba(34,197,94,0.4)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            🌿
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 72, fontWeight: 900, color: "#ffffff", letterSpacing: "-2px" }}>
              NU
            </span>
            <span style={{ fontSize: 72, fontWeight: 900, color: "#22c55e", letterSpacing: "-2px" }}>
              Carbon
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26, color: "#86efac",
            maxWidth: 760, textAlign: "center",
            lineHeight: 1.4, marginBottom: 48,
            display: "flex",
          }}
        >
          Northeastern AI Carbon Intelligence Platform
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { label: "Daily CO₂", value: "~222 kg" },
            { label: "Campus users", value: "24,000" },
            { label: "Transparency", value: "#1 peer" },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 12,
                padding: "14px 28px",
              }}
            >
              <span style={{ fontSize: 30, fontWeight: 900, color: "#22c55e" }}>{value}</span>
              <span style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Footer text */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 32,
            fontSize: 14,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: 2,
          }}
        >
          nucarbon.vercel.app · Ilia Duda · Spring 2026
        </div>
      </div>
    ),
    { ...size }
  );
}
