from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from openai import OpenAI

from .schemas import ChatRequest, ChatResponse
from .prompts import SYSTEM_PROMPT
from .router import run_chat
from .moderation import is_allowed
from .db import (
    init_db,
    save_message,
    get_messages,
    create_session,
    list_sessions,
    update_session_title,
)

app = FastAPI(title="AI Security Coach")

# Allow frontend (React app) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Create database tables when app starts
@app.on_event("startup")
def on_startup():
    init_db()


# --- MAIN CHAT ENDPOINT ---
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request):
    api_key = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API key")

    allowed, _ = is_allowed(req.message)
    if not allowed:
        raise HTTPException(status_code=400, detail="Message blocked by moderation.")

    client = OpenAI(api_key=api_key)
    session_id = req.session_id or "default"

    # ✅ Auto-create session if not yet in DB
    existing_sessions = [s.id for s in list_sessions()]
    if session_id not in existing_sessions:
        create_session(session_id, "New Chat")

    # --- Generate a short descriptive title for first message ---
    from .db import get_messages
    previous_msgs = get_messages(session_id)
    if len(previous_msgs) == 0:
        try:
            title_prompt = f"Summarize this question into 3–6 words for a chat title:\n\n{req.message}"
            title_resp = client.responses.create(
                model="gpt-4o-mini",
                input=[{"role": "user", "content": title_prompt}],
                temperature=0.3,
                max_output_tokens=20,
            )
            title_text = title_resp.output_text.strip().replace('"', "")
            if title_text:
                update_session_title(session_id, title_text)
        except Exception as e:
            print("⚠️ Title generation failed:", e)

    # --- Call your chat logic ---
    result = run_chat(req.message, SYSTEM_PROMPT, client)

    # --- Save both messages ---
    save_message(session_id, "user", req.message)
    save_message(session_id, "assistant", result["answer"])

    return ChatResponse(**result)



# --- SESSION MANAGEMENT ENDPOINTS ---

@app.post("/sessions/new")
def new_session():
    """Create a new chat session."""
    sid = str(uuid4())
    title = "New Chat"
    create_session(sid, title)
    return {"session_id": sid, "title": title}


@app.get("/sessions")
def get_sessions():
    """Return all saved sessions."""
    sessions = list_sessions()
    return [{"id": s.id, "title": s.title, "created_at": s.created_at} for s in sessions]


@app.get("/sessions/{session_id}")
def get_session_messages(session_id: str):
    """Return all messages for a given session."""
    msgs = get_messages(session_id)
    return [{"role": m.role, "content": m.content, "timestamp": m.timestamp} for m in msgs]


# --- ROOT ---
@app.get("/")
def root():
    return {"message": "AI Security Coach backend is running."}
