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

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "2rem",
      }}
    >
      {/* Brand */}
      <h1
        style={{
          fontSize: "2.4rem",
          fontWeight: 500,
          letterSpacing: "0.5px",
          marginBottom: "3rem",
        }}
      >
        Perspecu
      </h1>

      {/* Input */}
      <textarea
        placeholder="Enter unfiltered thought."
        value={text}
        disabled={locked}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "560px",
          height: "170px",
          padding: "1rem",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          border: "1px solid #2a2a2a",
          borderRadius: "2px",
          outline: "none",
          resize: "none",
          backgroundColor: "#0f0f0f",
          color: "#ffffff",
          opacity: locked ? 0.6 : 1,
        }}
      />

      {/* Controls */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        {(text || result) && (
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              color: "#666666",
              cursor: "pointer",
              fontSize: "0.8rem",
              letterSpacing: "0.3px",
            }}
          >
            Clear
          </button>
        )}

        <button
          onClick={handleClarify}
          disabled={loading || locked}
          style={{
            padding: "0.45rem 1.1rem",
            backgroundColor: "#111111",
            color: "#ffffff",
            border: "1px solid #2a2a2a",
            borderRadius: "2px",
            cursor: loading || locked ? "not-allowed" : "pointer",
            fontSize: "0.85rem",
            letterSpacing: "0.4px",
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
            maxWidth: "560px",
            width: "100%",
            fontSize: "0.95rem",
            lineHeight: 1.6,
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
                      marginTop: "1.6rem",
                      marginBottom: "0.5rem",
                      paddingLeft: "0.6rem",
                      borderLeft: "2px solid #333333",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
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
                    color: "#cccccc",
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
