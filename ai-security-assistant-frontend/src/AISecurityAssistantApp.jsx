import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AISecurityCoachApp() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("user_api_key") || "");

  // Load list of sessions on startup
  useEffect(() => {
    fetch("http://localhost:8000/sessions")
      .then((res) => res.json())
      .then(setSessions)
      .catch((err) => console.error("Error loading sessions:", err));
  }, []);

  // Load messages for a specific session
  async function loadSession(id) {
    setActiveSession(id);
    const res = await fetch(`http://localhost:8000/sessions/${id}`);
    const data = await res.json();
    setMessages(data);
  }

  // Create a new session
  async function startNewChat() {
    const res = await fetch("http://localhost:8000/sessions/new", { method: "POST" });
    const data = await res.json();
    setActiveSession(data.session_id);
    setMessages([]);
    setSessions((prev) => [data, ...prev]);
  }

  // Send message
async function sendMessage() {
  if (!input.trim()) return;
  if (!apiKey.trim()) {
    alert("Please enter your OpenAI API key first.");
    return;
  }

  // if no session, start one
  let sid = activeSession;
  if (!sid) {
    const res = await fetch("http://localhost:8000/sessions/new", { method: "POST" });
    const data = await res.json();
    sid = data.session_id;
    setActiveSession(sid);
    setSessions((prev) => [data, ...prev]);
  }

  const userMsg = { role: "user", content: input };
  setMessages((m) => [...m, userMsg]);
  setInput("");

  try {
    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message: input, session_id: sid }),
    });

    const data = await res.json();
    setMessages((m) => [...m, { role: "assistant", content: data.answer }]);

    // ✅ Reload sessions to refresh titles
    const updatedSessions = await fetch("http://localhost:8000/sessions").then((r) => r.json());
    setSessions(updatedSessions);

  } catch (e) {
    setMessages((m) => [...m, { role: "assistant", content: "Error: " + e.message }]);
  }
}


  // Save API key locally
  function handleApiKeySave() {
    localStorage.setItem("user_api_key", apiKey);
    alert("API key saved locally.");
  }

  // Handle Enter key
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #ccc",
          background: "#f8f8f8",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Sessions</h2>
        <button
          onClick={startNewChat}
          style={{
            padding: "8px",
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          + New Chat
        </button>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {sessions.length === 0 && <p style={{ color: "#666" }}>No sessions yet.</p>}
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => loadSession(s.id)}
              style={{
                padding: "8px",
                marginBottom: "6px",
                borderRadius: "6px",
                cursor: "pointer",
                background: activeSession === s.id ? "#ddd" : "#fff",
              }}
            >
              {s.title || "New Chat"}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "10px" }}>
          <input
            type="password"
            value={apiKey}
            placeholder="Enter OpenAI API key"
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: "100%", padding: "6px", borderRadius: "6px", marginBottom: "6px" }}
          />
          <button
            onClick={handleApiKeySave}
            style={{
              width: "100%",
              background: "#555",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
            }}
          >
            Save Key
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            padding: "12px",
            overflowY: "auto",
            background: "#fff",
            borderBottom: "1px solid #ccc",
          }}
        >
          {messages.length === 0 ? (
            <p style={{ color: "#777" }}>Start a chat or select a past session.</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                style={{
                  margin: "10px 0",
                  background: m.role === "assistant" ? "#f2f2f2" : "#e1e1e1",
                  borderRadius: "10px",
                  padding: "10px",
                  alignSelf: m.role === "assistant" ? "flex-start" : "flex-end",
                  maxWidth: "80%",
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", padding: "10px", background: "#f4f4f4" }}>
          <input
            value={input}
            placeholder="Ask a cybersecurity question..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginRight: "10px",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "10px 16px",
              background: "#222",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
