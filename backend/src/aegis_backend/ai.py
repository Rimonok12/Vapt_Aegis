"""Draft executive reports with a local Ollama model.

Only sanitised finding titles, severities and counts are ever sent to the model;
descriptions are truncated first. The prompt demands strict JSON and the result
is validated + repaired before it is stored.
"""

import json
import re
from datetime import datetime, timezone

import httpx

from .config import get_settings
from .models import AiReport, Finding, RemediationItem, SeverityCounts, compute_risk_score

SYSTEM_PROMPT = (
    "You are a senior security consultant writing executive-level vulnerability "
    "assessment reports for non-technical stakeholders. Reply with ONLY a single "
    "valid JSON object and no other text."
)

_JSON_BLOCK = re.compile(r"\{.*\}", re.DOTALL)


def _build_prompt(title: str, source: str, counts: SeverityCounts, findings: list[Finding], risk: int) -> str:
    top = sorted(
        findings,
        key=lambda f: (["critical", "high", "medium", "low", "info"].index(f.severity), -f.occurrences),
    )[:18]
    lines = [f"- [{f.severity.upper()}] {f.title} (hosts: {f.occurrences})" for f in top]
    return (
        f"Scan: {title}\nSource: {source}\nRisk score: {risk}/100\n"
        f"Severity totals: critical={counts.critical} high={counts.high} "
        f"medium={counts.medium} low={counts.low} info={counts.info}\n"
        f"Top findings:\n" + "\n".join(lines) + "\n\n"
        "Write a JSON object with EXACTLY these keys:\n"
        '"executiveSummary": 3-4 sentences for leadership;\n'
        '"businessRisk": 2-3 sentences on likely business impact;\n'
        '"compliancePosture": 2-3 sentences referencing ISO27001/PCI-DSS posture;\n'
        '"keyTakeaways": array of 4 short strings;\n'
        '"remediationPlan": array of 3-6 objects each with keys priority(int from 1), '
        'title, detail(1-2 sentences), severity(one of critical|high|medium|low), '
        'effort(one of low|medium|high), window(e.g. "7 days").\n'
        "Return valid JSON only."
    )


def _extract_json(raw: str) -> dict | None:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = _JSON_BLOCK.search(raw)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return None
    return None


def _band(risk: int) -> str:
    if risk >= 75:
        return "critical"
    if risk >= 50:
        return "high"
    if risk >= 25:
        return "moderate"
    return "low"


def _fallback(counts: SeverityCounts, findings: list[Finding], risk: int, model: str) -> AiReport:  # noqa: ARG001
    """Deterministic executive report, used when no LLM is reachable (e.g. hosted)."""

    order = ["critical", "high", "medium", "low", "info"]
    ranked = sorted(findings, key=lambda f: (order.index(f.severity), -f.occurrences))
    total = counts.total()
    band = _band(risk)
    urgent = counts.critical + counts.high
    top_titles = [f.title for f in ranked[:3]]

    breakdown = ", ".join(
        f"{getattr(counts, sev)} {sev}" for sev in order[:4] if getattr(counts, sev)
    ) or "no rated issues"
    summary = (
        f"This assessment recorded {total} finding{'s' if total != 1 else ''} ({breakdown}), "
        f"giving an overall risk score of {risk}/100 — a {band} risk posture. "
    )
    if top_titles:
        summary += f"The most pressing issues are {', '.join(top_titles[:-1])}"
        summary += f" and {top_titles[-1]}. " if len(top_titles) > 1 else f"{top_titles[0]}. "
    summary += (
        "Addressing the critical and high severity items first will remove most of the "
        "exposure." if urgent else "No critical or high severity issues were found; focus on "
        "hardening and routine patching."
    )

    plan_source = [f for f in ranked if f.severity in ("critical", "high")] or [
        f for f in ranked if f.severity in ("medium", "low")
    ]
    window = {"critical": "7 days", "high": "14 days", "medium": "30 days", "low": "90 days"}
    effort = {"critical": "medium", "high": "medium", "medium": "low", "low": "low"}
    plan = [
        RemediationItem(
            priority=i,
            title=finding.title,
            detail=(finding.recommendation or f"Patch or mitigate this {finding.severity} finding.")[:600],
            severity=finding.severity,  # type: ignore[arg-type]
            effort=effort[finding.severity],  # type: ignore[arg-type]
            window=window[finding.severity],
        )
        for i, finding in enumerate(plan_source[:5], start=1)
    ]

    return AiReport(
        # No LLM ran, so don't credit one.
        model="Aegis rules engine",
        generatedAt=datetime.now(timezone.utc).isoformat(),
        executiveSummary=summary,
        businessRisk=(
            "Unpatched or misconfigured services are the most common route to unauthorised "
            "access. Left open, these findings raise the likelihood of data exposure, service "
            "disruption and the regulatory and reputational cost that follows."
        ),
        compliancePosture=(
            "These findings map to ISO 27001 Annex A technical vulnerability management "
            "(A.8.8) and PCI-DSS requirements 6 and 11. Open critical and high items should be "
            "treated as audit blockers until remediated and re-tested."
        ),
        keyTakeaways=[
            f"Risk score {risk}/100 ({band}).",
            f"{counts.critical} critical and {counts.high} high severity findings need prompt action."
            if urgent
            else "No critical or high severity findings.",
            f"Start with: {top_titles[0]}." if top_titles else "Keep scanning on a regular cadence.",
            "Re-scan after remediation to confirm each fix.",
        ],
        remediationPlan=plan,
    )


def draft(title: str, source: str, counts: SeverityCounts, findings: list[Finding]) -> AiReport:
    settings = get_settings()
    risk = compute_risk_score(counts)
    prompt = _build_prompt(title, source, counts, findings, risk)

    try:
        with httpx.Client(base_url=settings.ollama_url, timeout=settings.ollama_timeout_seconds) as client:
            response = client.post(
                "/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.3, "num_ctx": 4096},
                    "system": SYSTEM_PROMPT,
                },
            )
            response.raise_for_status()
            raw = response.json().get("response", "")
    except Exception:  # noqa: BLE001 — model unavailable is expected; fall back.
        return _fallback(counts, findings, risk, settings.ollama_model)

    parsed = _extract_json(raw)
    if not parsed:
        return _fallback(counts, findings, risk, settings.ollama_model)

    try:
        plan = [
            RemediationItem(
                priority=int(item.get("priority", index + 1)),
                title=str(item.get("title", "Remediation"))[:180],
                detail=str(item.get("detail", ""))[:600],
                severity=item.get("severity", "medium")
                if item.get("severity") in ("critical", "high", "medium", "low")
                else "medium",
                effort=item.get("effort", "medium")
                if item.get("effort") in ("low", "medium", "high")
                else "medium",
                window=str(item.get("window", "30 days"))[:40],
            )
            for index, item in enumerate(parsed.get("remediationPlan", []))
            if isinstance(item, dict)
        ]
        takeaways = [str(t)[:300] for t in parsed.get("keyTakeaways", []) if isinstance(t, str)][:8]
        report = AiReport(
            model=settings.ollama_model,
            generatedAt=datetime.now(timezone.utc).isoformat(),
            executiveSummary=str(parsed.get("executiveSummary", ""))[:2000],
            businessRisk=str(parsed.get("businessRisk", ""))[:2000],
            compliancePosture=str(parsed.get("compliancePosture", ""))[:2000],
            remediationPlan=plan,
            keyTakeaways=takeaways,
        )
        if not report.executiveSummary:
            return _fallback(counts, findings, risk, settings.ollama_model)
        return report
    except Exception:  # noqa: BLE001
        return _fallback(counts, findings, risk, settings.ollama_model)
