import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import ChatRequest, ChatResponse
from .prompts import SYSTEM_PROMPT
from .router import run_chat
from .moderation import is_allowed
from openai import OpenAI

app = FastAPI(title="AI Security Coach")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for local development
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request):
    # 1. Moderation (optional)
    allowed, detail = is_allowed(req.message)
    if not allowed:
        raise HTTPException(status_code=400, detail={"moderation": detail})

    # 2. Get user's API key
    api_key = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API key")

    try:
        # 3. Create OpenAI client using user key
        client = OpenAI(api_key=api_key)

        # 4. Run chat and return response
        result = run_chat(req.message, SYSTEM_PROMPT, client)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
