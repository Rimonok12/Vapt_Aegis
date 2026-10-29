import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { styled } from '@yak/react';
import { cache } from 'react';

import { PdfExport } from '@/components/reports/pdf-export';
import { SeverityDonut, SeverityLegend } from '@/components/charts/severity-donut';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableScroll, Td, Th } from '@/components/ui/table';
import { getReport } from '@/lib/data/reports';
import { formatDate, formatDateTime, number } from '@/lib/format';
import { riskBand, totalFindings, type Finding, type Severity } from '@/lib/types';
import { radiusMd, textSm, textXs } from '@/styles/tokens';

const SOURCE_LABEL: Record<string, string> = {
  nessus: 'Nessus',
  nmap: 'Nmap',
  json: 'JSON',
};

const loadReport = cache(async (id: string) => getReport(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await loadReport(id);
  if (!report) return { title: 'Report' };
  return { title: report.title, robots: { index: false, follow: false } };
}

const Bar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;

  & > div:first-child {
    min-width: 0;
  }
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${textSm};
  color: var(--aq-muted-fg);
  margin-bottom: 10px;

  &:hover {
    color: var(--aq-fg);
  }
`;

const Title = styled.h1`
  font-size: clamp(1.35rem, 2.6vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.2;
  overflow-wrap: anywhere;
`;

const Meta = styled.p`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
  margin-top: 6px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 14px;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 14px;
  margin-top: 14px;
  align-items: start;

  @media (max-width: 1080px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Section = styled.section`
  display: grid;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--aq-muted-fg);
  margin-top: 8px;
`;

const Prose = styled.p`
  font-size: 0.9rem;
  line-height: 1.68;
  color: var(--aq-fg);
  white-space: pre-wrap;
`;

const Takeaways = styled.ul`
  display: grid;
  gap: 8px;
  margin-top: 4px;

  & li {
    position: relative;
    padding-left: 18px;
    font-size: 0.88rem;
    line-height: 1.55;
    color: var(--aq-fg);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.55em;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--aq-primary);
    }
  }
`;

const Code = styled.code`
  font-family: var(--font-geist-mono), monospace;
  font-size: ${textXs};
  background: var(--aq-muted);
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
`;

const Row = styled.tr`
  &[data-severity='critical'] ${Td}:first-child {
    box-shadow: inset 2px 0 0 var(--aq-sev-critical);
  }

  &[data-severity='high'] ${Td}:first-child {
    box-shadow: inset 2px 0 0 var(--aq-sev-high);
  }

  &[data-severity='medium'] ${Td}:first-child {
    box-shadow: inset 2px 0 0 var(--aq-sev-medium);
  }

  &[data-severity='low'] ${Td}:first-child {
    box-shadow: inset 2px 0 0 var(--aq-sev-low);
  }

  &[data-severity='info'] ${Td}:first-child {
    box-shadow: inset 2px 0 0 var(--aq-sev-info);
  }
`;

const Details = styled.details`
  & summary {
    cursor: pointer;
    font-size: ${textXs};
    color: var(--aq-primary);
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    &:hover {
      text-decoration: underline;
    }
  }

  &[open] summary {
    margin-bottom: 6px;
  }
`;

const Fix = styled.div`
  font-size: ${textXs};
  color: var(--aq-muted-fg);
  line-height: 1.55;
  background: var(--aq-muted);
  border-radius: ${radiusMd};
  padding: 8px 10px;
`;

const Plan = styled.ol`
  display: grid;
  gap: 10px;
  counter-reset: aq-plan;
`;

const PlanItem = styled.li`
  display: grid;
  gap: 4px;
  padding: 12px 14px 12px 42px;
  border: 1px solid var(--aq-border);
  border-radius: ${radiusMd};
  background: var(--aq-card);
  position: relative;
  counter-increment: aq-plan;

  &::before {
    content: counter(aq-plan);
    position: absolute;
    left: 13px;
    top: 12px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--aq-primary-soft);
    color: var(--aq-primary);
    font-size: ${textXs};
    font-weight: 700;
    display: grid;
    place-content: center;
  }

  & strong {
    font-size: 0.87rem;
    font-weight: 620;
  }

  & p {
    font-size: ${textSm};
    color: var(--aq-muted-fg);
    line-height: 1.55;
  }
`;

const PlanMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
`;

const SEV_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

function FindingRow({ finding }: { finding: Finding }) {
  return (
    <Row data-severity={finding.severity}>
      <Td>
        <div style={{ fontWeight: 560, lineHeight: 1.35, minWidth: 220 }}>{finding.title}</div>
        {finding.affected && (
          <div style={{ color: 'var(--aq-muted-fg)', fontSize: textXs, marginTop: 3 }}>
            {finding.affected}
            {finding.port ? ` · ${finding.port}/${finding.protocol ?? 'tcp'}` : ''}
          </div>
        )}
        {finding.description && (
          <Details>
            <summary>Details</summary>
            <Fix>{finding.description}</Fix>
          </Details>
        )}
      </Td>
      <Td>
        <Badge tone={finding.severity}>{finding.severity}</Badge>
      </Td>
      <Td style={{ fontVariantNumeric: 'tabular-nums' }}>
        {finding.cvss === null ? '—' : finding.cvss.toFixed(1)}
      </Td>
      <Td style={{ fontVariantNumeric: 'tabular-nums' }}>{number(finding.occurrences)}</Td>
      <Td>
        {finding.cves.length === 0 ? (
          <span style={{ color: 'var(--aq-muted-fg)' }}>—</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {finding.cves.slice(0, 4).map((cve) => (
              <Code key={cve}>{cve}</Code>
            ))}
            {finding.cves.length > 4 && (
              <span style={{ color: 'var(--aq-muted-fg)', fontSize: textXs }}>
                +{finding.cves.length - 4}
              </span>
            )}
          </div>
        )}
      </Td>
      <Td style={{ minWidth: 200 }}>
        {finding.recommendation ? (
          <Details>
            <summary>Remediation</summary>
            <Fix>{finding.recommendation}</Fix>
          </Details>
        ) : (
          <span style={{ color: 'var(--aq-muted-fg)' }}>—</span>
        )}
      </Td>
    </Row>
  );
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await loadReport(id);
  if (!report) notFound();

  const band = riskBand(report.risk_score);
  const findings = totalFindings(report.severity_counts);
  const sorted = [...report.findings].sort(
    (a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || b.occurrences - a.occurrences
  );
  const ai = report.ai_report;

  return (
    <div>
      <Bar>
        <div>
          <Back href="/reports">
            <ArrowLeft size={14} /> All reports
          </Back>
          <Title>{report.title}</Title>
          <Meta>
            {SOURCE_LABEL[report.source] ?? report.source}
            {report.scanned_at ? ` · scanned ${formatDate(report.scanned_at)}` : ''} · uploaded{' '}
            {formatDateTime(report.created_at)}
            {report.completed_at ? ` · completed ${formatDateTime(report.completed_at)}` : ''}
          </Meta>
        </div>
        <Actions>{report.status === 'ready' && <PdfExport report={report} />}</Actions>
      </Bar>

      {report.status === 'processing' && (
        <Card style={{ padding: 26, textAlign: 'center', alignItems: 'center', marginBottom: 14 }}>
          <Badge tone="info" style={{ marginBottom: 10 }}>
            Processing
          </Badge>
          <p
            style={{
              color: 'var(--aq-muted-fg)',
              fontSize: '0.87rem',
              maxWidth: '52ch',
              margin: '0 auto',
            }}
          >
            The backend is parsing the raw scan, stripping identifying details and drafting an
            executive summary. Refresh this page in a moment.
          </p>
        </Card>
      )}

      {report.status === 'failed' && (
        <Card style={{ padding: 26, textAlign: 'center', alignItems: 'center', marginBottom: 14 }}>
          <Badge tone="destructive" style={{ marginBottom: 10 }}>
            Processing failed
          </Badge>
          <p
            style={{
              color: 'var(--aq-muted-fg)',
              fontSize: '0.87rem',
              maxWidth: '52ch',
              margin: '0 auto',
            }}
          >
            {report.error ??
              'The parser could not read this file. Ask an administrator to re-upload it.'}
          </p>
        </Card>
      )}

      <Grid>
        <StatCard
          label="Risk score"
          value={report.risk_score === null ? '—' : `${report.risk_score}`}
          tone={band.tone === 'low' ? 'success' : band.tone}
          hint={band.label}
        />
        <StatCard
          label="Findings"
          value={number(findings)}
          hint={`${sorted.length} unique issues`}
        />
        <StatCard label="Assets" value={number(report.asset_count)} hint="sanitised host count" />
        <StatCard
          label="Critical"
          value={number(report.severity_counts.critical)}
          tone={report.severity_counts.critical > 0 ? 'critical' : 'success'}
          hint={report.severity_counts.critical > 0 ? 'immediate action' : 'none found'}
        />
      </Grid>

      <TwoCol>
        <Stack style={{ marginTop: 0 }}>
          {ai ? (
            <Card>
              <CardHeader>
                <CardTitle>Executive summary</CardTitle>
                <CardDescription>
                  Drafted locally by {ai.model} · {formatDateTime(ai.generatedAt)}. No scan data
                  leaves your infrastructure.
                </CardDescription>
              </CardHeader>
              <CardContent style={{ display: 'grid', gap: 18 }}>
                <Prose>{ai.executiveSummary}</Prose>
                <Section>
                  <SectionTitle>Business risk</SectionTitle>
                  <Prose>{ai.businessRisk}</Prose>
                </Section>
                <Section>
                  <SectionTitle>Compliance posture</SectionTitle>
                  <Prose>{ai.compliancePosture}</Prose>
                </Section>
                {ai.remediationPlan.length > 0 && (
                  <Section>
                    <SectionTitle>Remediation plan</SectionTitle>
                    <Plan>
                      {ai.remediationPlan.map((item, index) => (
                        <PlanItem key={index}>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                          <PlanMeta>
                            <Badge tone={item.severity}>{item.severity}</Badge>
                            <Badge tone="outline">{item.effort} effort</Badge>
                            <Badge tone="outline">{item.window}</Badge>
                          </PlanMeta>
                        </PlanItem>
                      ))}
                    </Plan>
                  </Section>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Executive summary</CardTitle>
                <CardDescription>
                  {report.status === 'processing'
                    ? 'The AI draft appears here once processing completes.'
                    : 'No AI draft is available for this report.'}
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          )}
        </Stack>

        <Stack style={{ marginTop: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Severity mix</CardTitle>
              <CardDescription>This scan only.</CardDescription>
            </CardHeader>
            <CardContent>
              <SeverityDonut counts={report.severity_counts} />
              <SeverityLegend counts={report.severity_counts} />
            </CardContent>
          </Card>

          {ai && ai.keyTakeaways.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key takeaways</CardTitle>
                <CardDescription>The points leadership should remember.</CardDescription>
              </CardHeader>
              <CardContent>
                <Takeaways>
                  {ai.keyTakeaways.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </Takeaways>
              </CardContent>
            </Card>
          )}
        </Stack>
      </TwoCol>

      <Card style={{ marginTop: 14 }}>
        <CardHeader>
          <CardTitle>Sanitised findings</CardTitle>
          <CardDescription>
            {sorted.length} unique issue{sorted.length === 1 ? '' : 's'}, most severe first.
            Hostnames, IP addresses and credentials are removed before storage.
          </CardDescription>
        </CardHeader>
        <CardContent style={{ paddingInline: 8 }}>
          {sorted.length === 0 ? (
            <p style={{ color: 'var(--aq-muted-fg)', fontSize: textSm, padding: '8px 12px' }}>
              No findings were recorded for this scan.
            </p>
          ) : (
            <TableScroll>
              <Table style={{ minWidth: 820 }}>
                <thead>
                  <tr>
                    <Th>Issue</Th>
                    <Th>Severity</Th>
                    <Th>CVSS</Th>
                    <Th>Hosts</Th>
                    <Th>CVEs</Th>
                    <Th>Fix</Th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((finding) => (
                    <FindingRow key={finding.id} finding={finding} />
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function Loading() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Skeleton style={{ height: 28, width: 320 }} />
      <Skeleton style={{ height: 14, width: 260, marginBottom: 8 }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
          gap: 14,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} style={{ height: 104, borderRadius: 14 }} />
        ))}
      </div>
      <Skeleton style={{ height: 420, borderRadius: 14 }} />
    </div>
  );
}
