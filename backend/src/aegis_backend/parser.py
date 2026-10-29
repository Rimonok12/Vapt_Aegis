"""Parse raw scanner exports into sanitised Finding lists.

Supported:
  .nessus  — Nessus Professional / Essentials XML v1
  .nmap/.xml — Nmap XML output
  .json    — generic array of findings (OSvuln, Qualys-lite, custom)

Every parse returns (findings, scanned_at_iso). All hostnames/IPs are replaced
with stable labels and free-text is scrubbed before leaving this module.
"""

import hashlib
import json
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from .models import Finding, ScanSource, Severity, SeverityCounts
from .sanitize import sanitize_reference, sanitize_text

SEVERITY_MAP = {"critical": "critical", "high": "high", "medium": "medium", "low": "low", "info": "info"}


@dataclass
class AssetRef:
    """A real host affected by a finding. Never stored in plaintext."""

    finding_id: str
    host: str
    port: Optional[str] = None
    protocol: Optional[str] = None


@dataclass
class ParseResult:
    findings: list[Finding] = field(default_factory=list)
    counts: SeverityCounts = field(default_factory=SeverityCounts)
    asset_count: int = 0
    scanned_at: Optional[str] = None
    assets: list[AssetRef] = field(default_factory=list)


def _host_tag(report_host: ET.Element, name: str) -> Optional[str]:
    for tag in report_host.iterfind("HostProperties/tag"):
        if tag.attrib.get("name") == name and tag.text:
            return tag.text.strip()
    return None


def _finding_id(*parts: object) -> str:
    digest = hashlib.sha1("|".join(str(p) for p in parts).encode()).hexdigest()
    return digest[:16]


def _nessus_severity(risk_info: str) -> Severity:
    mapping = {
        "critical": "critical",
        "high": "high",
        "medium": "medium",
        "low": "low",
        "none": "info",
        "info": "info",
    }
    return mapping.get((risk_info or "none").lower(), "info")


def parse_nessus(xml_bytes: bytes) -> ParseResult:
    root = ET.fromstring(xml_bytes)
    result = ParseResult()
    grouped: dict[str, Finding] = {}
    hosts: set[str] = set()

    report = root.find(".//Report")
    if report is not None:
        stop_date = report.attrib.get("stop_date")
        result.scanned_at = _iso(stop_date)
    if result.scanned_at is None:
        # Real Nessus exports record scan times per host in HostProperties.
        for tag in root.iterfind(".//HostProperties/tag"):
            if tag.attrib.get("name") in ("HOST_END_TIMESTAMP", "HOST_END") and tag.text:
                result.scanned_at = _iso(tag.text.strip())
                if result.scanned_at:
                    break

    for report_host in root.findall(".//ReportHost"):
        host_name = report_host.attrib.get("name", "")
        hosts.add(host_name or f"host-{len(hosts)}")
        ip = _host_tag(report_host, "host-ip")
        fqdn = _host_tag(report_host, "host-fqdn")
        host_label = ip or host_name or "unknown host"
        if fqdn and fqdn != host_label:
            host_label = f"{host_label} ({fqdn})"
        for item in report_host.findall("ReportItem"):
            port = item.attrib.get("port")
            proto = item.attrib.get("protocol")
            plugin_id = item.attrib.get("pluginID")
            family = item.attrib.get("family")
            name = item.attrib.get("pluginName") or item.attrib.get("name")
            risk = item.attrib.get("risk")
            severity = _nessus_severity(risk)

            description = _text(item, "plugin_output") or _text(item, "description")
            synopsis = _text(item, "synopsis")
            solution = _text(item, "solution")
            cvss = _extract_cvss(item)
            cves = _extract_cves(item)

            key = _finding_id(plugin_id, name, severity)
            finding = grouped.get(key)
            if finding is None:
                finding = Finding(
                    id=key,
                    title=sanitize_text(name)[:180],
                    severity=severity,
                    cvss=cvss,
                    cves=cves,
                    affected=sanitize_reference(family or synopsis or name),
                    description=sanitize_text((synopsis or "") + (" " + description if description else "")),
                    recommendation=sanitize_text(solution),
                    occurrences=1,
                    port=port,
                    protocol=proto,
                )
                grouped[key] = finding
            else:
                finding.occurrences += 1
            result.assets.append(AssetRef(key, host_label, port, proto))

    result.findings = list(grouped.values())
    result.asset_count = len(hosts)
    result.counts = _count(result.findings)
    return result


def _text(parent: ET.Element, tag: str) -> Optional[str]:
    node = parent.find(tag)
    return node.text if node is not None and node.text else None


def _extract_cvss(item: ET.Element) -> Optional[float]:
    for element in item.iter():
        if element.tag in ("cvss_base_score", "cvss3_base_score") and element.text:
            try:
                return float(element.text)
            except ValueError:
                continue
    return None


def _extract_cves(item: ET.Element) -> list[str]:
    out: list[str] = []
    for element in item.iter():
        if element.tag in ("cve", "plugin_set") and element.text:
            for token in re.findall(r"CVE-\d{4}-\d{4,7}", element.text, re.IGNORECASE):
                if token.upper() not in out:
                    out.append(token.upper())
    return out[:12]


def _iso(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    if value.isdigit():
        # Unix epoch seconds (Nmap `start`, Nessus HOST_END_TIMESTAMP).
        try:
            return datetime.fromtimestamp(int(value), tz=timezone.utc).isoformat()
        except (OverflowError, OSError, ValueError):
            return None
    for fmt in ("%Y%m%dT%H%M%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ", "%a %b %d %H:%M:%S %Y"):
        try:
            return datetime.strptime(value, fmt).replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            continue
    return None


def parse_nmap(xml_bytes: bytes) -> ParseResult:
    root = ET.fromstring(xml_bytes)
    result = ParseResult()
    grouped: dict[str, Finding] = {}
    hosts = 0

    result.scanned_at = _iso(root.attrib.get("start"))

    for host in root.findall("./host"):
        if host.find("status") is not None and host.find("status").attrib.get("state") != "up":
            continue
        hosts += 1
        address = host.find("address")
        hostname = host.find("hostnames/hostname")
        host_label = address.attrib.get("addr", "unknown host") if address is not None else "unknown host"
        if hostname is not None and hostname.attrib.get("name"):
            host_label = f"{host_label} ({hostname.attrib['name']})"
        for script in host.iter("script"):
            script_id = script.attrib.get("id", "")
            output = script.attrib.get("output", "")
            if not output:
                continue
            clean = sanitize_text(output)
            if not clean:
                continue
            key = _finding_id(script_id)
            finding = grouped.get(key)
            if finding is None:
                grouped[key] = Finding(
                    id=key,
                    title=f"Nmap {script_id}"[:180],
                    severity="medium" if "vuln" in script_id.lower() else "info",
                    cvss=None,
                    cves=re.findall(r"CVE-\d{4}-\d{4,7}", clean, re.IGNORECASE)[:12],
                    affected=sanitize_reference(script_id),
                    description=clean[:1200],
                    recommendation="Review the script output against vendor guidance.",
                    occurrences=1,
                )
            else:
                finding.occurrences += 1
            result.assets.append(AssetRef(key, host_label))

        for port in host.iter("port"):
            state = port.find("state")
            service = port.find("service")
            if state is None or state.attrib.get("state") != "open":
                continue
            if service is None:
                continue
            svc_name = service.attrib.get("name", "unknown")
            proto = port.attrib.get("protocol", "tcp")
            portid = port.attrib.get("portid")
            key = _finding_id("open", svc_name)
            finding = grouped.get(key)
            if finding is None:
                grouped[key] = Finding(
                    id=key,
                    title=f"Open service: {svc_name}",
                    severity="low",
                    cvss=None,
                    cves=[],
                    affected=sanitize_reference(f"{svc_name}"),
                    description=f"Service {svc_name} exposed over {proto}.",
                    recommendation="Confirm the service is required and fully patched.",
                    occurrences=1,
                    port=portid,
                    protocol=proto,
                )
            else:
                finding.occurrences += 1
            result.assets.append(AssetRef(key, host_label, portid, proto))

    result.findings = list(grouped.values())
    result.asset_count = hosts
    result.counts = _count(result.findings)
    return result


def parse_json(payload: bytes) -> ParseResult:
    data = json.loads(payload.decode("utf-8"))
    if not isinstance(data, (list, dict)):
        raise ValueError("JSON export must be an array or an object with 'findings'.")
    items = data if isinstance(data, list) else data.get("findings", data.get("results", []))
    if not isinstance(items, list):
        raise ValueError("'findings' must be an array.")
    result = ParseResult()
    grouped: dict[str, Finding] = {}
    hosts: set[str] = set()

    scanned = None
    if isinstance(data, dict):
        scanned = data.get("scanned_at") or data.get("scan_start")
    result.scanned_at = scanned if isinstance(scanned, str) else None

    for raw in items:
        if not isinstance(raw, dict):
            continue
        title = raw.get("title") or raw.get("name") or raw.get("plugin_name") or "Untitled finding"
        sev = str(raw.get("severity") or raw.get("risk") or "info").lower()
        severity = SEVERITY_MAP.get(sev, "info")
        host = raw.get("host") or raw.get("ip") or raw.get("target") or ""
        if host:
            hosts.add(host if isinstance(host, str) else json.dumps(host, sort_keys=True))
        cves = raw.get("cves") or raw.get("cve") or []
        if isinstance(cves, str):
            cves = [cves]
        cvss = raw.get("cvss") or raw.get("cvss_base_score")
        try:
            cvss_val = float(cvss) if cvss is not None else None
        except (TypeError, ValueError):
            cvss_val = None

        key = _finding_id(title, severity)
        finding = grouped.get(key)
        if finding is None:
            grouped[key] = Finding(
                id=key,
                title=sanitize_text(title)[:180],
                severity=severity,
                cvss=cvss_val,
                cves=[c.upper() for c in cves if isinstance(c, str)][:12],
                affected=sanitize_reference(raw.get("affected") or raw.get("service") or title),
                description=sanitize_text(raw.get("description") or raw.get("synopsis") or ""),
                recommendation=sanitize_text(raw.get("recommendation") or raw.get("solution") or ""),
                occurrences=1,
                port=str(raw.get("port") or "") or None,
                protocol=str(raw.get("protocol") or "") or None,
            )
        else:
            finding.occurrences += 1
        if host:
            result.assets.append(
                AssetRef(
                    key,
                    host if isinstance(host, str) else json.dumps(host, sort_keys=True),
                    str(raw.get("port") or "") or None,
                    str(raw.get("protocol") or "") or None,
                )
            )

    result.findings = list(grouped.values())
    result.asset_count = len(hosts)
    result.counts = _count(result.findings)
    return result


def _count(findings: list[Finding]) -> SeverityCounts:
    counts = SeverityCounts()
    for finding in findings:
        setattr(counts, finding.severity, getattr(counts, finding.severity) + finding.occurrences)
    return counts


def parse(source: ScanSource, payload: bytes) -> ParseResult:
    if source == "nessus":
        return parse_nessus(payload)
    if source == "nmap":
        return parse_nmap(payload)
    return parse_json(payload)
