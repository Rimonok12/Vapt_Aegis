"""AES-256-GCM encryption for host identifiers in the per-asset map.

Format: base64url(nonce[12] || ciphertext+tag). The web app decrypts the same
format with Node's crypto module (web/src/lib/assets.ts) for admins only.
"""

import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from .config import get_settings


def _key() -> bytes | None:
    raw = get_settings().asset_encryption_key.strip()
    if not raw:
        return None
    key = base64.b64decode(raw)
    if len(key) != 32:
        raise ValueError("ASSET_ENCRYPTION_KEY must be 32 bytes, base64-encoded.")
    return key


def enabled() -> bool:
    return _key() is not None


def encrypt(plaintext: str) -> str:
    key = _key()
    if key is None:
        raise RuntimeError("ASSET_ENCRYPTION_KEY is not configured.")
    nonce = os.urandom(12)
    sealed = AESGCM(key).encrypt(nonce, plaintext.encode("utf-8"), None)
    return base64.urlsafe_b64encode(nonce + sealed).decode("ascii")


def decrypt(token: str) -> str:
    key = _key()
    if key is None:
        raise RuntimeError("ASSET_ENCRYPTION_KEY is not configured.")
    blob = base64.urlsafe_b64decode(token.encode("ascii"))
    return AESGCM(key).decrypt(blob[:12], blob[12:], None).decode("utf-8")
