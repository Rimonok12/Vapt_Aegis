"""Vercel entrypoint: exposes the FastAPI app from the src/ package layout."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from aegis_backend.main import app  # noqa: E402

__all__ = ["app"]
