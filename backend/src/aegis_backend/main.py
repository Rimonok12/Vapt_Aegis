"""Aegis ingest API.

POST /api/v1/ingest  (multipart: file, report_id; Bearer internal token)
  1. Parse the raw scanner export.
  2. Sanitise + persist findings (status stays 'processing').
  3. Draft the executive report locally via Ollama.
  4. Flip the row to 'ready' (or 'failed' with a human-readable error).

The endpoint runs the pipeline synchronously inside a threadpool worker so the
caller can observe parse errors immediately; long AI runs simply outlive the
web app's HTTP timeout and finish in the background.
"""

from __future__ import annotations

import hmac
import os
import uuid
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from . import ai, parser, store
from .config import get_settings
from .models import ScanSource, compute_risk_score

app = FastAPI(
    title="Aegis ingest",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

ALLOWED_SUFFIXES = {
    ".nessus": "nessus",
    ".nmap": "nmap",
    ".xml": "nmap",
    ".json": "json",
}


def require_token(authorization: Optional[str] = Header(default=None)) -> None:
    settings = get_settings()
    if not settings.internal_token:
        # Local development: no shared secret configured, so the endpoint is open.
        # A hosted deployment without a token must never accept uploads.
        if os.environ.get("VERCEL") or os.environ.get("RENDER"):
            raise HTTPException(status_code=503, detail="INTERNAL_TOKEN is not configured.")
        return
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token.")
    presented = authorization.split(" ", 1)[1].strip()
    if not hmac.compare_digest(presented, settings.internal_token):
        raise HTTPException(status_code=403, detail="Invalid token.")


@app.get("/healthz")
def healthz() -> dict:
    settings = get_settings()
    return {
        "ok": True,
        "supabase": settings.configured,
        "model": settings.ollama_model,
    }


def _run_pipeline(report_id: str, source: ScanSource, filename: str, payload: bytes) -> dict:
    try:
        result = parser.parse(source, payload)
    except Exception as exc:  # noqa: BLE001
        message = f"Could not parse {filename}: {exc.__class__.__name__}."
        try:
            store.mark_failed(report_id, message)
        except Exception:  # noqa: BLE001
            pass
        raise HTTPException(status_code=422, detail=message) from exc

    try:
        store.update_parsed(report_id, result)
    except store.ReportNotFound as exc:
        raise HTTPException(status_code=404, detail="Report row not found.") from exc
    except Exception as exc:  # noqa: BLE001
        try:
            store.mark_failed(report_id, f"Could not save findings: {exc.__class__.__name__}.")
        except Exception:  # noqa: BLE001
            pass
        raise HTTPException(status_code=502, detail="Could not save findings.") from exc

    asset_rows = store.save_assets(report_id, result)

    try:
        ai_report = ai.draft(filename, source, result.counts, result.findings)
        risk = compute_risk_score(result.counts)
        store.mark_ready(report_id, ai_report, risk)
    except Exception as exc:  # noqa: BLE001
        try:
            store.mark_failed(report_id, f"AI drafting failed: {exc.__class__.__name__}.")
        except Exception:  # noqa: BLE001
            pass
        raise HTTPException(status_code=500, detail="AI drafting failed.") from exc

    return {
        "reportId": report_id,
        "findings": len(result.findings),
        "assets": result.asset_count,
        "riskScore": risk,
        "assetRows": asset_rows,
        "status": "ready",
    }


@app.post("/api/v1/ingest", dependencies=[Depends(require_token)])
async def ingest(
    file: UploadFile = File(...),
    report_id: str = Form(...),
) -> dict:
    settings = get_settings()
    try:
        report_id = str(uuid.UUID(report_id))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="report_id must be a UUID.") from exc
    filename = (file.filename or "").lower()
    suffix = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""
    source = ALLOWED_SUFFIXES.get(suffix)
    if source is None:
        raise HTTPException(status_code=422, detail=f"Unsupported file type: {suffix or filename}")

    payload = await file.read()
    if len(payload) == 0:
        raise HTTPException(status_code=422, detail="Empty file.")
    if len(payload) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File exceeds the size limit.")

    return await run_in_threadpool(_run_pipeline, report_id, source, filename, payload)
