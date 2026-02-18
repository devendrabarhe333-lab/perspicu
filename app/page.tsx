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
      const res = await fetch("/api/perspecu", {
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
        justifyContent: "flex-start",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#000000",
        color: "#f5f5f5",
        padding: "2rem",
        paddingTop: "18vh",
      }}
    >
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "2.8rem",
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
            marginTop: "0.8rem",
            color: "#777",
            letterSpacing: "0.6px",
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
          maxWidth: "520px",
          minHeight: "160px",
          padding: "1rem",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          border: "1px solid #1f1f1f",
          borderRadius: "0px",
          outline: "none",
          resize: "vertical",
          backgroundColor: "#0d0d0d",
          color: "#f5f5f5",
          opacity: locked ? 0.6 : 1,
        }}
      />

      {/* Buttons */}
      <div style={{ marginTop: "1.2rem", display: "flex", gap: "1rem" }}>
        {(text || result) && (
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              color: "#777",
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
            padding: "0.5rem 1.2rem",
            backgroundColor: "#ffffff",
            color: "#000000",
            border: "none",
            borderRadius: "2px",
            cursor: loading || locked ? "not-allowed" : "pointer",
            fontSize: "0.85rem",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Processing…" : "Clarify"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: "3rem",
            maxWidth: "520px",
            width: "100%",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            opacity: 0.95,
          }}
        >
          {result
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line, i) => {
              const trimmed = line.trim();
              const isHeader =
                trimmed.startsWith("1.") ||
                trimmed.startsWith("2.") ||
                trimmed.startsWith("3.");

              if (isHeader) {
                return (
                  <div
                    key={i}
                    style={{
                      marginTop: "2rem",
                      marginBottom: "0.6rem",
                      paddingLeft: "0.75rem",
                      borderLeft: "2px solid #1f1f1f",
                      fontWeight: 500,
                      letterSpacing: "0.4px",
                    }}
                  >
                    {trimmed}
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  style={{
                    marginBottom: "0.5rem",
                    paddingLeft: "1rem",
                    color: "#777",
                  }}
                >
                  {trimmed}
                </div>
              );
            })}
        </div>
      )}
    </main>
  );
}
