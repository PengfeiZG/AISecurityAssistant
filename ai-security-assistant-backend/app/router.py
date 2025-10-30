import asyncio
from typing import Dict, Any, List, Optional
from openai import OpenAI
from .tools import DNSLookupIn, TCPCheckIn, HTTPProbeIn, dns_lookup, tcp_check, http_probe


# --- Define tools explicitly for the Responses API ---
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "dns_lookup",
            "description": "Resolve DNS records (A, AAAA, MX, CNAME, TXT) for a domain.",
            "parameters": DNSLookupIn.model_json_schema()
        },
    },
    {
        "type": "function",
        "function": {
            "name": "tcp_check",
            "description": "Attempt a TCP connect to host:port and report reachability.",
            "parameters": TCPCheckIn.model_json_schema()
        },
    },
    {
        "type": "function",
        "function": {
            "name": "http_probe",
            "description": "Perform an HTTP GET request and return status and headers.",
            "parameters": HTTPProbeIn.model_json_schema()
        },
    },
]


def run_chat(message: str, system_prompt: str, client) -> dict:
    resp = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        temperature=0.3,
        max_output_tokens=800,
    )
    return {"answer": resp.output_text, "steps": None}
