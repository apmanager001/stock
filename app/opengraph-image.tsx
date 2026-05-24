import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Foundry Stack template preview";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background:
          "linear-gradient(135deg, rgb(255, 247, 237) 0%, rgb(242, 248, 255) 50%, rgb(255, 252, 235) 100%)",
        color: "rgb(31, 41, 55)",
        padding: "64px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          borderRadius: "40px",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          background: "rgba(255, 255, 255, 0.82)",
          padding: "48px",
          boxShadow: "0 30px 120px rgba(15, 23, 42, 0.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "76px",
                height: "76px",
                borderRadius: "24px",
                background:
                  "linear-gradient(135deg, rgb(234, 88, 12), rgb(14, 165, 233))",
                color: "white",
                fontSize: "32px",
                fontWeight: 700,
              }}
            >
              F
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div
                style={{
                  fontSize: "20px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(71, 85, 105, 0.9)",
                }}
              >
                Cloneable starter
              </div>
              <div style={{ fontSize: "34px", fontWeight: 700 }}>
                {siteConfig.name}
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div
              style={{
                fontSize: "64px",
                lineHeight: 1.05,
                fontWeight: 700,
                maxWidth: "900px",
              }}
            >
              Better Auth, MongoDB, analytics, and SEO already wired.
            </div>
            <div
              style={{
                fontSize: "28px",
                lineHeight: 1.5,
                color: "rgba(51, 65, 85, 0.92)",
                maxWidth: "900px",
              }}
            >
              {siteConfig.tagline}
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {siteConfig.stack.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "999px",
                  border: "1px solid rgba(148, 163, 184, 0.32)",
                  padding: "12px 20px",
                  fontSize: "20px",
                  background: "rgba(255, 255, 255, 0.76)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
