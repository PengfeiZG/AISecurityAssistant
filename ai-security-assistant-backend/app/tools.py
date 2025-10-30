import socket, httpx, dns.resolver
from pydantic import BaseModel
from typing import Dict, Any

class DNSLookupIn(BaseModel):
    domain: str

class TCPCheckIn(BaseModel):
    host: str
    port: int
    timeout: float = 2.0

class HTTPProbeIn(BaseModel):
    url: str
    timeout: float = 3.0

def dns_lookup(domain: str) -> Dict[str, Any]:
    out = {}
    resolver = dns.resolver.Resolver()
    resolver.lifetime = 2.0
    for rtype in ("A", "AAAA", "MX", "CNAME", "TXT"):
        try:
            out[rtype] = [str(rr) for rr in resolver.resolve(domain, rtype)]
        except Exception:
            pass
    return out

def tcp_check(host: str, port: int, timeout: float = 2.0) -> Dict[str, Any]:
    s = socket.socket()
    s.settimeout(timeout)
    try:
        s.connect((host, port))
        return {"reachable": True}
    except Exception as e:
        return {"reachable": False, "error": str(e)}
    finally:
        s.close()

async def http_probe(url: str, timeout: float = 3.0) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as c:
        r = await c.get(url, headers={"Accept": "*/*"})
        return {"status": r.status_code, "headers": dict(r.headers)}
