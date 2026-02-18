"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  async function handleClarify() {
    if (!text.trim() || locked) return;

    setLoading(true);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json().catch(() => ({ result: "" }));
      setResult(data.result ?? "");
      setLocked(true);
    } catch (error) {
      console.error("Frontend error:", error);
      setResult("Connection error.");
    }

    setLoading(false);
  }

  function handleClear() {
    setText("");
    setResult("");
    setLocked(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#000",
        color: "#f5f5f5",
        padding: "2rem",
        paddingTop: "18vh",
      }}
    >
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: 400,
            letterSpacing: "1px",
            margin: 0,
          }}
        >
          Perspecu
        </h1>

        <p
          style={{
            fontSize: "0.8rem",
            marginTop: "0.9rem",
            color: "#999",
            letterSpacing: "0.8px",
          }}
        >
          Cognitive clarity engine
        </p>
      </div>

      {/* Input */}
      <textarea
        placeholder="Enter unfiltered thought."
        value={text}
        disabled={locked}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "560px",
          minHeight: "170px",
          padding: "1.1rem",
          fontSize: "0.95rem",
          lineHeight: 1.7,
          border: "1px solid #262626",
          outline: "none",
          resize: "vertical",
          backgroundColor: "#0d0d0d",
          color: "#f5f5f5",
          opacity: locked ? 0.6 : 1,
        }}
      />

      {/* Buttons */}
      <div style={{ marginTop: "1.4rem", display: "flex", gap: "1rem" }}>
        {(text || result) && (
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              color: "#999",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Clear
          </button>
        )}

        <button
          onClick={handleClarify}
          disabled={loading || locked}
          style={{
            padding: "0.55rem 1.3rem",
            backgroundColor: "#ffffff",
            color: "#000",
            border: "none",
            borderRadius: "2px",
            cursor: loading || locked ? "not-allowed" : "pointer",
            fontSize: "0.85rem",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Processing…" : "Clarify"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: "3.5rem",
            maxWidth: "560px",
            width: "100%",
          }}
        >
          {result
            .split(/\n(?=\d\.\s)/)
            .map((section, index) => {
              const lines = section.trim().split("\n");
              const title = lines[0];
              const content = lines.slice(1).join(" ");

              return (
                <div
                  key={index}
                  style={{
                    marginBottom: "2.5rem",
                    paddingLeft: "1.2rem",
                    borderLeft: "2px solid #444",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "1.05rem",
                      marginBottom: "0.8rem",
                      letterSpacing: "0.4px",
                      color: "#ffffff",
                    }}
                  >
                    {title}
                  </div>

                  <div
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: 1.7,
                      color: "#d6d6d6",
                    }}
                  >
                    {content}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </main>
  );
}
