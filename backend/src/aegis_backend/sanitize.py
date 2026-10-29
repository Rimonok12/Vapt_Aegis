"""Sanitisation: strip anything identifying before storage or AI drafting.

Raw scanner output can contain internal hostnames, private/public IP addresses,
MAC addresses, credentials embedded in plugin output, and Windows domain paths.
Nothing like that may ever reach Supabase or the model prompt.
"""

import ipaddress
import re

# IPv4 (with optional port) and IPv6 in brackets.
_IPV4 = re.compile(
    r"\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?\b"
)
_IPV6 = re.compile(r"\[?([0-9a-fA-F:]{2,40}:[0-9a-fA-F:]{0,40})\]?(?:/\d{1,3})?\b")
_CIDR = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}/\d{1,2}\b")
_MAC = re.compile(r"\b(?:[0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}\b")
# hostname.domain.tld or AD-style FQDNs, but keep CVE IDs / known safe tokens.
_HOSTNAME = re.compile(
    r"\b(?:[A-Za-z0-9_][A-Za-z0-9_-]{0,62}\.)+(?:local|internal|corp|lan|intra|localdomain|com|net|org|internal)\b",
    re.IGNORECASE,
)
_URL_WITH_HOST = re.compile(r"(?:https?|ftp|ssh|rdp)://([^/\s:@]+)([:@][^\s/]*)?/[^\s]*", re.IGNORECASE)
_USER_AT = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
_WIN_PATH = re.compile(r"\b[A-Za-z]:\\(?:[^\\\s]+\\?)*")
_CRED_LINE = re.compile(
    r"(?:password|passwd|pwd|secret|token|api[_-]?key|private[_-]?key)\s*[:=]\s*\S+",
    re.IGNORECASE,
)
_NETBIOS = re.compile(r"\bWorkgroup\s*=\s*\S+", re.IGNORECASE)

REDACTED = "[redacted]"

# Public advisory / vendor reference hosts. Links to these are remediation
# references, never client infrastructure, so they are kept verbatim.
PUBLIC_REFERENCE_HOSTS = (
    "nvd.nist.gov",
    "cve.mitre.org",
    "cve.org",
    "cwe.mitre.org",
    "cisa.gov",
    "tenable.com",
    "nmap.org",
    "owasp.org",
    "microsoft.com",
    "redhat.com",
    "ubuntu.com",
    "debian.org",
    "exploit-db.com",
)

# Product names that look like hostnames to _HOSTNAME (e.g. "ASP.NET").
PRODUCT_TOKENS = {"asp.net", "microsoft.net", "ado.net", "vb.net"}

# Plugin output keys that are always identifying.
OUTPUT_DROP_KEYS = {"synack", "traceroute", "interface", "macaddress"}


def is_private_ip(text: str) -> bool:
    try:
        return ipaddress.ip_address(text).is_private
    except ValueError:
        return False


def _is_public_reference(host: str) -> bool:
    host = host.lower().rstrip(".")
    return any(host == domain or host.endswith("." + domain) for domain in PUBLIC_REFERENCE_HOSTS)


def _redact_url(match: re.Match[str]) -> str:
    return match.group(0) if _is_public_reference(match.group(1)) else REDACTED


def _redact_hostname(match: re.Match[str]) -> str:
    token = match.group(0)
    if token.lower() in PRODUCT_TOKENS or _is_public_reference(token):
        return token
    return REDACTED


def sanitize_text(value: str | None) -> str:
    """Remove every identifying pattern from a free-text blob."""

    if not value:
        return ""
    text = value
    text = _URL_WITH_HOST.sub(_redact_url, text)
    text = _CRED_LINE.sub(REDACTED, text)
    text = _NETBIOS.sub(REDACTED, text)
    text = _WIN_PATH.sub(REDACTED, text)
    text = _USER_AT.sub(REDACTED, text)
    text = _CIDR.sub(REDACTED, text)
    text = _MAC.sub(REDACTED, text)
    text = _IPV4.sub(REDACTED, text)

    def _ipv6(match: re.Match[str]) -> str:
        candidate = match.group(1)
        try:
            ipaddress.IPv6Address(candidate.strip("[]"))
            return REDACTED
        except ValueError:
            return match.group(0)

    text = _IPV6.sub(_ipv6, text)
    text = _HOSTNAME.sub(_redact_hostname, text)
    # Collapse repeated redactions and stray whitespace.
    text = re.sub(r"(?:\[redacted\]\s*){2,}", "[redacted]\n", text)
    return text.strip()


def sanitize_host_label(hostname: str | None, fallback: str = "asset") -> str:
    """Replace a hostname with a stable, non-identifying label."""

    if not hostname:
        return fallback
    return f"{fallback}-{abs(hash(sanitize_text(hostname))) % 10_000:04d}"


def sanitize_reference(ref: str | None) -> str:
    """Sanitise an 'affected' reference such as a service banner or URL path."""

    cleaned = sanitize_text(ref)
    if not cleaned:
        return "unknown service"
    return cleaned[:160]
