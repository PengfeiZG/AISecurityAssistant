from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from openai import OpenAI, OpenAIError
import httpx  # for network-related exceptions
from fastapi import status

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
        raise HTTPException(status_code=401, detail="⚠️ Missing API key. Please enter your OpenAI key in the app.")

    allowed, _ = is_allowed(req.message)
    if not allowed:
        raise HTTPException(status_code=400, detail="⚠️ Message blocked by moderation policy.")

    # ✅ Initialize OpenAI client safely
    try:
        client = OpenAI(api_key=api_key)
    except Exception:
        raise HTTPException(status_code=400, detail="⚠️ Invalid API key format or client setup error.")

    session_id = req.session_id or "default"

    # ✅ Auto-create session if not yet in DB
    existing_sessions = [s.id for s in list_sessions()]
    if session_id not in existing_sessions:
        create_session(session_id, "New Chat")

    # --- Generate short title for first message ---
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

    # --- Call OpenAI safely ---
    try:
        result = run_chat(req.message, SYSTEM_PROMPT, client)
    except OpenAIError as e:
        error_msg = str(e)

        # Simplify the message for known bad-key errors
        if "Incorrect API key provided" in error_msg:
            clean_msg = (
                "⚠️ Invalid API key. Please check your key at "
                "https://platform.openai.com/account/api-keys."
            )
        elif "401" in error_msg:
            clean_msg = "⚠️ Unauthorized. Your API key is incorrect or expired."
        elif "429" in error_msg:
            clean_msg = "⚠️ Too many requests. Please wait a moment and try again."
        else:
            # Fallback generic message for any other OpenAI API issues
            clean_msg = "⚠️ OpenAI API error. Please try again later."

        raise HTTPException(status_code=502, detail=clean_msg)
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="🚫 Network error: Unable to reach OpenAI API.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"⚠️ Unexpected error: {str(e)}")

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

@app.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str):
    """Delete a chat session and its messages."""
    from sqlmodel import Session, select
    from .db import engine, ChatSession, ChatMessage

    with Session(engine) as s:
        # Delete messages first
        msgs = s.exec(select(ChatMessage).where(ChatMessage.session_id == session_id)).all()
        for m in msgs:
            s.delete(m)

        # Delete the session itself
        sess = s.exec(select(ChatSession).where(ChatSession.id == session_id)).first()
        if not sess:
            raise HTTPException(status_code=404, detail="Session not found.")
        s.delete(sess)
        s.commit()

    return

# --- ROOT ---
@app.get("/")
def root():
    return {"message": "AI Security Coach backend is running."}
