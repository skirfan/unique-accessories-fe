import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b1530",
        backgroundImage:
          "radial-gradient(circle at 25% 25%, #16234f 0%, #0b1530 60%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "24px 48px",
          borderRadius: 24,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "#2563eb",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontWeight: 700,
            color: "white",
          }}
        >
          UA
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 56, fontWeight: 800, color: "white" }}>
            Unique Accessories
          </span>
          <span style={{ fontSize: 26, color: "#ff9036", marginTop: 4 }}>
            Smart Accessories. Better Life.
          </span>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
