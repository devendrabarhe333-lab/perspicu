"use client";

import { useState, useEffect } from "react";

const CHECKOUT_URL =
  "https://perspicu.lemonsqueezy.com/checkout/buy/5067523d-5eff-4054-90ce-5963d080e43e";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [usesLeft, setUsesLeft] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);

  // Init usage + Pro unlock
  useEffect(() => {
    if (typeof window === "undefined") return;

    const used = Number(localStorage.getItem("perspicu_uses") || 0);
    setUsesLeft(3 - used);

    if (window.location.search.includes("pro=true")) {
      localStorage.setItem("perspicu_pro", "true");
    }

    setIsPro(localStorage.getItem("perspicu_pro") === "true");
  }, []);

  async function handleClarify() {
    if (!text.trim() || locked) return;

    const used = Number(localStorage.getItem("perspicu_uses") || 0);
    if (!isPro && used >= 3) return;

    if (!isPro) {
      localStorage.setItem("perspicu_uses", String(used + 1));
      setUsesLeft(3 - (used + 1));
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setResult(data.result ?? "");
      setLocked(true);
    } catch {
      setResult("");
    }

    setLoading(false);
  }

  function handleClear() {
    setText("");
    setResult("");
    setLocked(false);
  }

  const bgColor = darkMode ? "#000000" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#111111";
  const borderColor = darkMode ? "#333333" : "#dddddd";

  const showPaywall = !isPro && usesLeft !== null && usesLeft <= 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: bgColor,
        color: textColor,
        padding: "2rem",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 600, margin: 0 }}>
          Perspicu
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: darkMode ? "#ffffff" : "#000000",
            color: darkMode ? "#000000" : "#ffffff",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <p
        style={{
          fontSize: "1.1rem",
          marginBottom: "2.5rem",
          color: darkMode ? "#cccccc" : "#444444",
        }}
      >
        Clarity, sentence by sentence.
      </p>

      {!showPaywall ? (
        <>
          <textarea
            placeholder="This space accepts confusion. Output removes it."
            value={text}
            disabled={locked}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "700px",
              minHeight: "220px",
              padding: "1.2rem",
              fontSize: "1rem",
              lineHeight: 1.7,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              outline: "none",
              resize: "vertical",
              backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
              color: textColor,
              opacity: locked ? 0.6 : 1,
            }}
          />

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            {(text || result) && (
              <button
                onClick={handleClear}
                style={{
                  background: "none",
                  border: "none",
                  color: darkMode ? "#999999" : "#666666",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Clear
              </button>
            )}

            <button
              onClick={handleClarify}
              disabled={loading || locked}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: loading
                  ? "#555555"
                  : darkMode
                  ? "#ffffff"
                  : "#000000",
                color: loading
                  ? "#999999"
                  : darkMode
                  ? "#000000"
                  : "#ffffff",
                border: "none",
                borderRadius: "4px",
                cursor: loading || locked ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              {loading ? "Organizing…" : "Clarify"}
            </button>
          </div>

          {!isPro && usesLeft !== null && (
            <p
              style={{
                marginTop: "0.8rem",
                fontSize: "0.75rem",
                color: darkMode ? "#888888" : "#999999",
              }}
            >
              {usesLeft} free clarifications left
            </p>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontSize: "1rem", opacity: 0.9 }}>
            3 free clarifications used.
          </p>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            Pro: Unlimited clarity + export — $12/month
          </p>

          <a
            href={`${CHECKOUT_URL}?redirect_url=https://perspicu.vercel.app/?pro=true`}
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#ffffff",
              color: "#000000",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "0.9rem",
            }}
          >
            Upgrade to Pro
          </a>
        </div>
      )}

      {result && (
        <pre
          style={{
            marginTop: "2.5rem",
            maxWidth: "700px",
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            fontSize: "1rem",
            opacity: 0.95,
          }}
        >
{result}
        </pre>
      )}

      <p
        style={{
          marginTop: "2rem",
          fontSize: "0.8rem",
          color: darkMode ? "#888888" : "#999999",
        }}
      >
        Structural clarity only.
      </p>
    </main>
  );
}
