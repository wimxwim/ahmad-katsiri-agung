import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AKAL Center — Platform Guru-Siswa + AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          background: "#005231",
          color: "white",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        AKAL Center
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
