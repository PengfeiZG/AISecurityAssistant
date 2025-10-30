import os
from openai import OpenAI

def is_allowed(text: str):
    """
    Run moderation if a server API key is available.
    If none set, skip moderation (fail-open for local use).
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return True, None  # no global key set

    try:
        client = OpenAI(api_key=api_key)
        result = client.moderations.create(model="omni-moderation-latest", input=text)
        flagged = result.results[0].flagged
        return (not flagged), (result.results[0].categories if flagged else None)
    except Exception:
        return True, None
