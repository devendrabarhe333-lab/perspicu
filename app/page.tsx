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

  // Init usage + secure Pro unlock
  useEffect(() => {
    if (typeof window === "undefined") return;

    const used = Number(localStorage.getItem("perspicu_uses") || 0);
    setUsesLeft(3 - used);

    const params = new URLSearchParams(window.location.search);
    const proParam = params.get("pro");
    const keyParam = params.get("key");

    if (
      proParam === "true" &&
      keyParam === process.env.NEXT_PUBLIC_PRO_UNLOCK_KEY
    ) {
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
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Perspicu</h1>

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
              border: `1px solid ${borderColor}`,
              backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
              color: textColor,
            }}
          />

          <button onClick={handleClarify} disabled={loading || locked}>
            {loading ? "Organizing…" : "Clarify"}
          </button>

          {!isPro && usesLeft !== null && (
            <p>{usesLeft} free clarifications left</p>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p>3 free clarifications used.</p>
          <p>Pro: Unlimited clarity — $12/month</p>

          <a
            href={`${CHECKOUT_URL}?redirect_url=https://perspicu.vercel.app/?pro=true&key=${process.env.NEXT_PUBLIC_PRO_UNLOCK_KEY}`}
          >
            Upgrade to Pro
          </a>
        </div>
      )}

      {result && <pre>{result}</pre>}
    </main>
  );
}
