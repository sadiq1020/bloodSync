import { ImageResponse } from "next/og";

// 1200x630 static OG image
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Root OG image — dark wine background, logo wordmark, and landing headline.
 * Uses the default system font (safe, no external fetch risk).
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px 72px",
          backgroundColor: "#130b0d",
          position: "relative",
        }}
      >
        {/* Blood-red accent bar on left */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 6,
            height: 630,
            backgroundColor: "#d92d43",
          }}
        />

        {/* Logo wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {/* Drop icon placeholder */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              backgroundColor: "rgba(217,45,67,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 14,
                height: 18,
                backgroundColor: "#d92d43",
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              }}
            />
          </div>
          <span
            style={{
              color: "#f2e7e1",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            BloodSync
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            color: "#f2e7e1",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.08,
            margin: 0,
            maxWidth: 900,
            letterSpacing: "-0.03em",
          }}
        >
          {"Don\u2019t let a request "}
          <span style={{ color: "#d92d43" }}>get buried</span>
          {" in a feed."}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "#a8958f",
            fontSize: 24,
            marginTop: 20,
            marginBottom: 0,
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Blood donor matching across 64 districts in Bangladesh.
        </p>

        {/* Domain */}
        <p
          style={{
            position: "absolute",
            bottom: 48,
            right: 72,
            color: "#6f5f5b",
            fontSize: 18,
            fontFamily: "monospace",
            margin: 0,
          }}
        >
          bloodsync.app
        </p>
      </div>
    ),
    { ...size }
  );
}

