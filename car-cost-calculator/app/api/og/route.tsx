import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const BRAND = {
  paper: "#F7F5F0",
  ink: "#10151A",
  moss: "#2F5D50",
  rust: "#B5502F",
  muted: "#6B7280",
};

/** Fetches /logo.png from this same deployment and returns it as a data URL. */
async function loadLogoDataUrl(origin: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}/logo.png`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const variant = searchParams.get("variant") || "";
  const monthly = searchParams.get("monthly") || "";
  const currency = searchParams.get("currency") || "";
  const costPerKm = searchParams.get("costPerKm") || "";
  const city = searchParams.get("city") || "";
  const country = searchParams.get("country") || "";
  const fuelLabel = searchParams.get("fuelLabel") || "Fuel";

  const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const logo = await loadLogoDataUrl(origin);

  const vehicleName = [make, model, variant].filter(Boolean).join(" ") || "Your car";
  const locationLine = [city, country].filter(Boolean).join(", ");
  // Symbol currencies ($, ₹) read better with no gap; multi-letter codes (PKR) need one.
  const moneyGap = currency.length > 1 ? " " : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          backgroundColor: BRAND.paper,
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} width={56} height={56} alt="" style={{ objectFit: "contain" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: BRAND.ink }}>CarCost Calculator</span>
            <span style={{ fontSize: 18, color: BRAND.muted }}>Know the real cost. Drive smarter.</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "20px" }}>
          <span style={{ fontSize: 30, color: BRAND.muted, marginBottom: "8px" }}>
            {vehicleName}
            {locationLine ? ` · ${locationLine}` : ""}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            <span style={{ fontSize: 88, fontWeight: 700, color: BRAND.ink, lineHeight: 1 }}>
              {currency}{moneyGap}{monthly}
            </span>
            <span style={{ fontSize: 30, color: BRAND.muted }}>/ month</span>
          </div>
          <div style={{ display: "flex", marginTop: "28px", gap: "16px" }}>
            {costPerKm && (
              <div
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(47,93,80,0.12)",
                  color: BRAND.moss,
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {currency}{moneyGap}{costPerKm} / km
              </div>
            )}
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: "999px",
                backgroundColor: "rgba(192,138,62,0.15)",
                color: BRAND.rust,
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {fuelLabel} · Maintenance · Insurance · Registration
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", fontSize: 20, color: BRAND.muted }}>
          Full ownership breakdown & sources inside
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
