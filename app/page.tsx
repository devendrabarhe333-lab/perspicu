"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  // Load saved structures on mount
  useEffect(() => {
    const stored = localStorage.getItem("perspecu_saved");
    if (stored) {
      try {
        setSaved(JSON.parse(stored));
      } catch {
        setSaved([]);
      }
    }
  }, []);

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

  function handleSave() {
    if (!result) return;

    const updated = [result, ...saved].slice(0, 5);
    setSaved(updated);
    localStorage.setItem("perspecu_saved", JSON.stringify(updated));
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

      {/* Saved Structures */}
      {saved.length > 0 && (
        <div
          style={{
            maxWidth: "560px",
            width: "100%",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#888",
              marginBottom: "0.8rem",
              letterSpacing: "0.6px",
            }}
          >
            Your last 5 structures
          </div>

          {saved.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "1rem",
                paddingLeft: "1rem",
                borderLeft: "2px solid #333",
                fontSize: "0.8rem",
                color: "#aaa",
                lineHeight: 1.6,
                opacity: 0.8,
              }}
            >
              {item.slice(0, 160)}...
            </div>
          ))}
        </div>
      )}

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

          {/* Save Button */}
          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={handleSave}
              style={{
                background: "none",
                border: "1px solid #333",
                padding: "0.4rem 0.9rem",
                fontSize: "0.8rem",
                cursor: "pointer",
                color: "#999",
              }}
            >
              Keep this
            </button>
          </div>
        </div>
      )}
    </main>
  );
}