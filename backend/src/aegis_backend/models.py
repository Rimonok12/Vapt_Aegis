"""Pydantic models mirroring the TypeScript shapes in web/src/lib/types.ts.

The web app and this backend must agree exactly on these JSON shapes because
they are stored in the same Supabase `reports` columns.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field

Severity = Literal["critical", "high", "medium", "low", "info"]
ScanSource = Literal["nessus", "nmap", "json"]
ReportStatus = Literal["processing", "ready", "failed"]

SEVERITY_WEIGHT: dict[str, int] = {
    "critical": 10,
    "high": 6,
    "medium": 3,
    "low": 1,
    "info": 0,
}

SEVERITY_ORDER: list[str] = ["critical", "high", "medium", "low", "info"]


class SeverityCounts(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    info: int = 0

    def total(self) -> int:
        return self.critical + self.high + self.medium + self.low + self.info


class Finding(BaseModel):
    """A single sanitised vulnerability, stripped of IPs, hostnames, secrets."""

    id: str
    title: str
    severity: Severity
    cvss: Optional[float] = None
    cves: list[str] = Field(default_factory=list)
    affected: str = ""
    description: str = ""
    recommendation: str = ""
    occurrences: int = 1
    port: Optional[str] = None
    protocol: Optional[str] = None


class RemediationItem(BaseModel):
    priority: int
    title: str
    detail: str
    severity: Severity
    effort: Literal["low", "medium", "high"] = "medium"
    window: str = "30 days"


class AiReport(BaseModel):
    model: str
    generatedAt: str
    executiveSummary: str
    businessRisk: str
    compliancePosture: str
    remediationPlan: list[RemediationItem] = Field(default_factory=list)
    keyTakeaways: list[str] = Field(default_factory=list)


def compute_risk_score(counts: SeverityCounts) -> int:
    """Deterministic 0-100 risk score, identical to computeRiskScore() in TS."""

    raw = sum(getattr(counts, sev) * SEVERITY_WEIGHT[sev] for sev in SEVERITY_ORDER)
    return min(100, round((raw / 120) * 100))
