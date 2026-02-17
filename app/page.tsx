"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

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

  const bgColor = darkMode ? "#0a0a0a" : "#ffffff";
  const textColor = darkMode ? "#eaeaea" : "#111111";
  const borderColor = darkMode ? "#2a2a2a" : "#dddddd";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: bgColor,
        color: textColor,
        padding: "2rem",
        paddingTop: "3rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 600, margin: 0 }}>
          Perspecu
        </h1>

        {/* Minimal theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            opacity: 0.6,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={textColor}
            strokeWidth="1.5"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>
      </div>

      {/* Input */}
      <textarea
        placeholder="Enter unfiltered thought."
        value={text}
        disabled={locked}
        onChange={(e) => setText(e.target.value)}
        style={{
          marginTop: "2.5rem",
          width: "100%",
          maxWidth: "700px",
          minHeight: "220px",
          padding: "1.1rem",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          border: `1px solid ${borderColor}`,
          borderRadius: "4px",
          outline: "none",
          resize: "vertical",
          backgroundColor: darkMode ? "#141414" : "#ffffff",
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
              color: darkMode ? "#777777" : "#666666",
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
            padding: "0.45rem 0.9rem",
            backgroundColor: darkMode ? "#eaeaea" : "#111111",
            color: darkMode ? "#000000" : "#ffffff",
            border: "none",
            borderRadius: "3px",
            cursor: loading || locked ? "not-allowed" : "pointer",
            fontSize: "0.85rem",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Compressing…" : "Clarify"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: "2.5rem",
            maxWidth: "700px",
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
                      paddingLeft: "0.75rem",
                      borderLeft: `2px solid ${
                        darkMode ? "#444" : "#999"
                      }`,
                      fontWeight: 600,
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
                    marginBottom: "0.45rem",
                    paddingLeft: "1.2rem",
                    color: darkMode ? "#bbbbbb" : "#444444",
                  }}
                >
                    {trimmed}
                </div>
              );
            })}

          <div
            style={{
              marginTop: "1.5rem",
              fontSize: "0.75rem",
              color: darkMode ? "#666666" : "#888888",
            }}
          >
            No advice. Structural clarity only.
          </div>
        </div>
      )}

      <p
        style={{
          marginTop: "3rem",
          fontSize: "0.7rem",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: darkMode ? "#555555" : "#888888",
        }}
      >
        Cognitive distortion compression
      </p>
    </main>
  );
}
