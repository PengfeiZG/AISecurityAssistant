import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AISecurityCoachApp() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("user_api_key") || "");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi. I'm your AI Security Assistant. Paste your API key above, then ask a cybersecurity question." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  // Save API key locally
  function handleApiKeySave() {
    localStorage.setItem("user_api_key", apiKey);
    alert("API key saved locally. It will be used for your next questions.");
  }

  // Send chat message
  async function send() {
    if (!apiKey.trim()) {
      alert("Please enter your OpenAI API key first.");
      return;
    }
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!res.ok) {
        const errText = (await res.text()) || "Error connecting to backend.";
        setMessages((m) => [...m, { role: "assistant", text: errText }]);
      } else {
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", text: data.answer }]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Request error: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>AI Security Coach</h1>
        <div className="api-box">
          <input
            type="password"
            value={apiKey}
            placeholder="Enter your OpenAI API key..."
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button onClick={handleApiKeySave}>Save Key</button>
        </div>
      </header>

      <main className="chat-container">
        <div ref={listRef} className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              {m.role === "assistant" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, children }) {
                      return !inline ? (
                        <pre
                          style={{
                            background: "#f4f4f4",
                            padding: "8px",
                            borderRadius: "6px",
                            overflowX: "auto",
                          }}
                        >
                          <code>{children}</code>
                        </pre>
                      ) : (
                        <code
                          style={{
                            background: "#eee",
                            padding: "2px 4px",
                            borderRadius: "4px",
                          }}
                        >
                          {children}
                        </code>
                      );
                    },
                    strong: ({ children }) => (
                      <strong style={{ fontWeight: 600 }}>{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ marginLeft: "1.2em" }}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ marginLeft: "1.2em" }}>{children}</ol>
                    ),
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              ) : (
                <div>{m.text}</div>
              )}
            </div>
          ))}
          {loading && <div className="message assistant">Thinking...</div>}
        </div>

        <div className="input-bar">
          <input
            value={input}
            placeholder="Ask a cybersecurity question..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          <button onClick={send} disabled={loading}>
            Send
          </button>
        </div>
      </main>

      <footer className="footer">
        <small>Local API key storage only. No data shared externally.</small>
      </footer>
    </div>
  );
}
