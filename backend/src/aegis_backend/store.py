"""Minimal Supabase writes with the service-role key.

The backend only ever updates the `reports` row created by the web app. It
never creates organisations or users.
"""

from datetime import datetime, timezone

from supabase import create_client  # type: ignore[import-untyped]

from .config import get_settings
from .models import AiReport
from .parser import ParseResult


class ReportNotFound(Exception):
    pass


def _client():
    settings = get_settings()
    if not settings.configured:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SECRET_KEY are not configured.")
    return create_client(settings.supabase_url, settings.supabase_secret_key)


def update_parsed(report_id: str, result: ParseResult) -> None:
    """Store sanitised findings and counts; status stays 'processing'."""

    client = _client()
    response = (
        client.table("reports")
        .update(
            {
                "findings": [f.model_dump() for f in result.findings],
                "severity_counts": result.counts.model_dump(),
                "asset_count": result.asset_count,
                "scanned_at": result.scanned_at or datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("id", report_id)
        .execute()
    )
    if not response.data:
        raise ReportNotFound(report_id)


def mark_ready(report_id: str, ai: AiReport, risk_score: int) -> None:
    client = _client()
    client.table("reports").update(
        {
            "status": "ready",
            "ai_report": ai.model_dump(),
            "ai_model": ai.model,
            "risk_score": risk_score,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "error": None,
        }
    ).eq("id", report_id).execute()


def mark_failed(report_id: str, message: str) -> None:
    client = _client()
    client.table("reports").update(
        {
            "status": "failed",
            "error": message[:500],
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", report_id).execute()
