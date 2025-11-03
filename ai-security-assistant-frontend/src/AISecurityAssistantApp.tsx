import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AISecurityCoachApp() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("user_api_key") || "");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load sessions
  async function refreshSessions() {
    try {
      const res = await fetch("http://localhost:8000/sessions");
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setSessions(sorted);
    } catch (err) {
      console.error("Error loading sessions:", err);
    }
  }

  useEffect(() => {
    refreshSessions();
  }, []);

  // Load selected session
  async function loadSession(id) {
    setActiveSession(id);
    const res = await fetch(`http://localhost:8000/sessions/${id}`);
    const data = await res.json();
    setMessages(data);
    setSidebarOpen(false); // auto-hide after selecting
  }

  // Start new chat
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

  // ✅ Check API key
  if (!apiKey.trim()) {
    setMessages((m) => [
      ...m,
      { role: "assistant", content: "⚠️ Please enter your OpenAI API key first." },
    ]);
    return;
  }

  // ✅ Check Internet connection before sending
  if (!navigator.onLine) {
    setMessages((m) => [
      ...m,
      { role: "assistant", content: "🚫 You appear to be offline. Please reconnect and try again." },
    ]);
    return;
  }

  // ✅ Create or reuse a chat session
  let sid = activeSession;
  if (!sid) {
    const res = await fetch("http://localhost:8000/sessions/new", { method: "POST" });
    const data = await res.json();
    sid = data.session_id;
    setActiveSession(sid);
    setSessions((prev) => [data, ...prev]);
  }

  // ✅ Add user's message to chat
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

    if (!res.ok) {
      const errData = await res.json();
      const msg = errData.detail || "⚠️ Unexpected backend error.";
      setMessages((m) => [...m, { role: "assistant", content: msg }]);
      return;
    }

    const data = await res.json();
    setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
    await refreshSessions();

  } catch (e) {
    // ✅ Catch fetch/network errors
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: "🚫 Network error: Unable to reach backend or internet connection lost.",
      },
    ]);
  }
}



  function handleApiKeySave() {
    localStorage.setItem("user_api_key", apiKey);
    alert("API key saved locally.");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* --- Sidebar (Chat History) --- */}
      <div
        style={{
          width: "250px",
          background: "#f8f8f8",
          borderRight: "1px solid #ccc",
          height: "100%",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          zIndex: 10,
          top: 0,
          left: sidebarOpen ? "0" : "-270px",
          transition: "left 0.3s ease",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Sessions</h2>
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            background: "#bbb",
            border: "none",
            borderRadius: "6px",
            padding: "6px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          Close
        </button>

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
          {sessions.length === 0 && <p>No sessions yet.</p>}
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
              {s.title?.trim() || "New Chat"}
            </div>
          ))}
        </div>

        <div>
          <input
            type="password"
            value={apiKey}
            placeholder="Enter OpenAI API key"
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              width: "100%",
              padding: "6px",
              borderRadius: "6px",
              marginBottom: "6px",
              border: "1px solid #ccc",
            }}
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

      {/* --- Main Chat Area --- */}
        {/* --- Main Chat Area --- */}
<div
  style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    marginLeft: sidebarOpen ? "250px" : "0",
    transition: "margin-left 0.3s ease",
  }}
>
  {/* --- Top Bar (fix for toggle button placement) --- */}
  <div
    style={{
      background: "#222",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      height: "42px",
      flexShrink: 0,
    }}
  >
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      style={{
        background: "#444",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "6px 10px",
        cursor: "pointer",
      }}
    >
      ☰ {sidebarOpen ? "Hide" : "Chats"}
    </button>
    <span style={{ fontSize: "14px", opacity: 0.8 }}>AI Security Coach</span>
  </div>

  {/* --- Chat Messages --- */}
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
    <div ref={chatEndRef} />
  </div>

  {/* --- Input Bar --- */}
  <div
    style={{
      display: "flex",
      padding: "10px",
      background: "#f4f4f4",
      flexShrink: 0,
    }}
  >
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
