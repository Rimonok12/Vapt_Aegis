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


def _fallback(counts: SeverityCounts, findings: list[Finding], risk: int, model: str) -> AiReport:
    total = counts.total()
    sev = "critical" if counts.critical else "high" if counts.high else "medium" if counts.medium else "low"
    top_titles = [f.title for f in findings[:3]]
    plan = []
    for i, finding in enumerate([f for f in findings if f.severity in ("critical", "high")][:5], start=1):
        plan.append(
            RemediationItem(
                priority=i,
                title=finding.title,
                detail=finding.recommendation or f"Patch or mitigate this {finding.severity} finding.",
                severity=finding.severity,  # type: ignore[arg-type]
                effort="medium",
                window="7 days" if finding.severity == "critical" else "30 days",
            )
        )
    return AiReport(
        model=model,
        generatedAt=datetime.now(timezone.utc).isoformat(),
        executiveSummary=(
            f"The {sev} assessment identified {total} findings across the estate with a risk "
            f"score of {risk}/100. " + (f"Notable issues include {', '.join(top_titles)}. " if top_titles else "")
            + "Prioritised remediation of the highest severity items is recommended."
        ),
        businessRisk=(
            "Exposure of unpatched or misconfigured services increases the likelihood of "
            "unauthorised access and data breach, with associated operational and reputational cost."
        ),
        compliancePosture=(
            "Findings in this report map to ISO 27001 Annex A technical controls and PCI-DSS "
            "requirement 6/11. Closing critical and high items should be treated as a compliance blocker."
        ),
        keyTakeaways=[
            f"{counts.critical} critical and {counts.high} high findings require prompt action.",
            f"Overall risk score {risk}/100.",
            "Remediate highest-severity items first.",
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
