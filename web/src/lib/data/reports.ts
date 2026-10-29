import 'server-only';

import { cache } from 'react';

import { createAuthClient } from '@/lib/supabase/server';
import {
  computeRiskScore,
  normalizeCounts,
  type Finding,
  type AiReport,
  type ReportRow,
  type ScanSource,
  type SeverityCounts,
} from '@/lib/types';

/**
 * All reads go through the RLS-scoped server client: a client can only ever see
 * reports belonging to their own verified organization. No query here passes an
 * organization id that came from the browser.
 */

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function hydrate(row: Record<string, unknown>): ReportRow {
  const counts = normalizeCounts(row.severity_counts as SeverityCounts | null);
  const findings = asArray<Finding>(row.findings);
  const storedScore = typeof row.risk_score === 'number' ? row.risk_score : null;
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    title: String(row.title ?? 'Untitled scan'),
    source: (row.source ?? 'json') as ScanSource,
    original_filename: (row.original_filename as string | null) ?? null,
    status: (row.status ?? 'processing') as ReportRow['status'],
    risk_score: storedScore ?? (row.status === 'ready' ? computeRiskScore(counts) : null),
    severity_counts: counts,
    asset_count: Number(row.asset_count ?? 0),
    findings,
    ai_report: (row.ai_report as AiReport | null) ?? null,
    ai_model: (row.ai_model as string | null) ?? null,
    error: (row.error as string | null) ?? null,
    scanned_at: (row.scanned_at as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: String(row.created_at ?? new Date(0).toISOString()),
    completed_at: (row.completed_at as string | null) ?? null,
  };
}

/** Reports for the caller's organization, newest first. */
export const listReports = cache(async (): Promise<ReportRow[]> => {
  const supabase = await createAuthClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(120);

  if (error) throw new Error(`Failed to load reports: ${error.message}`);
  return (data ?? []).map(hydrate);
});

/** A single report, or null when it does not exist / is not visible to the caller. */
export const getReport = cache(async (id: string): Promise<ReportRow | null> => {
  if (!id) return null;
  const supabase = await createAuthClient();
  const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load report: ${error.message}`);
  return data ? hydrate(data) : null;
});

export type PortfolioSummary = {
  totalReports: number;
  readyReports: number;
  processing: number;
  failed: number;
  counts: SeverityCounts;
  latestScore: number | null;
  previousScore: number | null;
  scoreDelta: number | null;
  openCritical: number;
  assets: number;
  trend: { label: string; score: number; date: string }[];
};

/** Aggregate KPIs for the dashboard, derived from the visible report set. */
export function summarize(reports: ReportRow[]): PortfolioSummary {
  const counts = normalizeCounts(null);
  let ready = 0;
  let processing = 0;
  let failed = 0;

  for (const report of reports) {
    if (report.status === 'ready') ready += 1;
    else if (report.status === 'processing') processing += 1;
    else failed += 1;
    for (const key of Object.keys(counts) as (keyof SeverityCounts)[]) {
      counts[key] += report.severity_counts[key] ?? 0;
    }
  }

  const readySorted = reports.filter((r) => r.status === 'ready' && r.risk_score !== null);
  const latest = readySorted[0] ?? null;
  const previous = readySorted[1] ?? null;

  // Oldest -> newest for the compliance trend chart.
  const trend = readySorted
    .slice(0, 12)
    .reverse()
    .map((r) => ({
      label: new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short' }),
      score: r.risk_score ?? 0,
      date: r.created_at,
    }));

  return {
    totalReports: reports.length,
    readyReports: ready,
    processing,
    failed,
    counts,
    latestScore: latest?.risk_score ?? null,
    previousScore: previous?.risk_score ?? null,
    scoreDelta:
      latest?.risk_score != null && previous?.risk_score != null
        ? latest.risk_score - previous.risk_score
        : null,
    openCritical: counts.critical,
    assets: reports.reduce((sum, r) => sum + (r.asset_count || 0), 0),
    trend,
  };
}
