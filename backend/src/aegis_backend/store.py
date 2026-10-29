"""Minimal Supabase writes with the service-role key.

The backend only ever updates the `reports` row created by the web app. It
never creates organisations or users.
"""

from datetime import datetime, timezone

from supabase import create_client  # type: ignore[import-untyped]

import logging

from . import crypto
from .config import get_settings
from .models import AiReport
from .parser import ParseResult

log = logging.getLogger(__name__)


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


def save_assets(report_id: str, result: ParseResult) -> int:
    """Store the encrypted finding → host map (admin-only, migration 002).

    Best effort: a missing key or table never fails the ingest. Each distinct
    host gets a stable, non-identifying label (asset-0001, …) for this report.
    """

    if not result.assets or not crypto.enabled():
        return 0
    try:
        client = _client()
        report = client.table("reports").select("organization_id").eq("id", report_id).single().execute()
        organization_id = report.data["organization_id"]

        labels: dict[str, str] = {}
        sealed: dict[str, str] = {}
        rows = []
        seen: set[tuple[str, str, str | None]] = set()
        for ref in result.assets:
            if ref.host not in labels:
                labels[ref.host] = f"asset-{len(labels) + 1:04d}"
                sealed[ref.host] = crypto.encrypt(ref.host)
            dedupe = (ref.finding_id, ref.host, ref.port)
            if dedupe in seen:
                continue
            seen.add(dedupe)
            rows.append(
                {
                    "report_id": report_id,
                    "organization_id": organization_id,
                    "finding_id": ref.finding_id,
                    "label": labels[ref.host],
                    "host_enc": sealed[ref.host],
                    "port": ref.port,
                    "protocol": ref.protocol,
                }
            )

        client.table("report_assets").delete().eq("report_id", report_id).execute()
        for start in range(0, len(rows), 500):
            client.table("report_assets").insert(rows[start : start + 500]).execute()
        return len(rows)
    except Exception as exc:  # noqa: BLE001
        log.warning("Skipping per-asset map for %s: %s", report_id, exc.__class__.__name__)
        return 0


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
