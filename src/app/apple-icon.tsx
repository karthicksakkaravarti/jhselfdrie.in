import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 38, background: "#0d665d", color: "white", fontFamily: "Georgia", fontSize: 66, fontWeight: 700 }}><span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 118, height: 118, borderRadius: 30, background: "#ed684d" }}>JH</span></div>, size);
}
