/**
 * Domain types shared by the web app and mirrored by the FastAPI backend.
 * These describe the JSON shapes stored in the Supabase `reports` table.
 */

export type UserRole = 'client' | 'admin';
export type ReportStatus = 'processing' | 'ready' | 'failed';
export type ScanSource = 'nessus' | 'nmap' | 'json';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type SeverityCounts = Record<Severity, number>;

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const;

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Informational',
};

/** A single sanitised vulnerability, stripped of IPs, hostnames and secrets. */
export type Finding = {
  id: string;
  title: string;
  severity: Severity;
  cvss: number | null;
  cves: string[];
  /** Affected service or port range — never an IP address. */
  affected: string;
  description: string;
  recommendation: string;
  /** How many hosts/assets the finding was observed on. */
  occurrences: number;
  port?: string | null;
  protocol?: string | null;
};

export type RemediationItem = {
  priority: number;
  title: string;
  detail: string;
  severity: Severity;
  effort: 'low' | 'medium' | 'high';
  window: string;
};

export type AiReport = {
  model: string;
  generatedAt: string;
  executiveSummary: string;
  businessRisk: string;
  compliancePosture: string;
  remediationPlan: RemediationItem[];
  keyTakeaways: string[];
};

export type ReportRow = {
  id: string;
  organization_id: string;
  title: string;
  source: ScanSource;
  original_filename: string | null;
  status: ReportStatus;
  risk_score: number | null;
  severity_counts: SeverityCounts;
  asset_count: number;
  findings: Finding[];
  ai_report: AiReport | null;
  ai_model: string | null;
  error: string | null;
  scanned_at: string | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
};

export type ProfileRow = {
  id: string;
  organization_id: string | null;
  email: string | null;
  full_name: string;
  role: UserRole;
  nid_verified: boolean;
  nid_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type SessionContext = {
  userId: string;
  email: string | null;
  profile: ProfileRow;
  organization: OrganizationRow | null;
};

export function emptySeverityCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
}

export function normalizeCounts(
  partial: Partial<SeverityCounts> | null | undefined
): SeverityCounts {
  const base = emptySeverityCounts();
  if (!partial) return base;
  for (const key of SEVERITIES) {
    const value = partial[key];
    if (typeof value === 'number' && Number.isFinite(value)) base[key] = value;
  }
  return base;
}

export function totalFindings(counts: SeverityCounts): number {
  return SEVERITIES.reduce((sum, key) => sum + counts[key], 0);
}

/** Deterministic risk score used when the backend does not supply one. */
export function computeRiskScore(counts: SeverityCounts): number {
  const weights: Record<Severity, number> = {
    critical: 10,
    high: 6,
    medium: 3,
    low: 1,
    info: 0,
  };
  const raw = SEVERITIES.reduce((sum, key) => sum + counts[key] * weights[key], 0);
  // Saturating scale: ~120 weighted points maps to a perfect 100.
  return Math.min(100, Math.round((raw / 120) * 100));
}

export type RiskBand = {
  label: string;
  tone: 'critical' | 'high' | 'medium' | 'low';
};

export function riskBand(score: number | null): RiskBand {
  if (score === null) return { label: 'Pending', tone: 'low' };
  if (score >= 75) return { label: 'Critical', tone: 'critical' };
  if (score >= 50) return { label: 'High', tone: 'high' };
  if (score >= 25) return { label: 'Moderate', tone: 'medium' };
  return { label: 'Low', tone: 'low' };
}
