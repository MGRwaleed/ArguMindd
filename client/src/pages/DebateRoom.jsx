import { useEffect, useState, useRef } from "react";
import PageLayout from "../components/PageLayout";

const STREAMING_URL = "https://stream.argumind.space";

function buildDebateURL() {
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId   = user?._id || user?.id || "";
  const username = user?.name || user?.username || user?.email || "Unknown";
  const email    = user?.email || "";
  if (!userId) console.error("[ArguMind] DebateRoom: userId missing in userInfo —", user);
  const params = new URLSearchParams({ userId, username, email });
  return `${STREAMING_URL}?${params.toString()}`;
}

export default function DebateRoom() {
  const [blocked, setBlocked] = useState(false);
  const opened = useRef(false); // prevent multiple tabs on re-render

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;

    const url = buildDebateURL();
    console.log("[ArguMind] Auto-opening debate arena:", url);

    const newTab = window.open(url, "_blank");

    // window.open returns null if the browser blocked the popup
    if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
      console.warn("[ArguMind] Popup blocked — showing fallback button");
      setBlocked(true);
    }
  }, []);

  return (
    <PageLayout>
      <div
        style={{
          height: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {blocked ? (
          <>
            <p style={{ fontSize: "15px", margin: 0, opacity: 0.7 }}>
              Your browser blocked the popup.
            </p>
            <button
              onClick={() => {
                opened.current = false; // allow one more open
                const newTab = window.open(buildDebateURL(), "_blank");
                if (newTab) setBlocked(false);
              }}
              style={{
                padding: "12px 28px",
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: "8px",
                border: "none",
                background: "#6366f1",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              🎙️ Click to Enter Debate
            </button>
          </>
        ) : (
          <p style={{ fontSize: "15px", margin: 0, opacity: 0.5 }}>
            Opening debate arena…
          </p>
        )}
      </div>
    </PageLayout>
  );
}