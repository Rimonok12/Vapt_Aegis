import type { Metadata } from 'next';
import { styled } from '@yak/react';

import { SeverityDonut, SeverityLegend } from '@/components/charts/severity-donut';
import { RiskTrendChart } from '@/components/charts/risk-trend';
import { CountUp } from '@/components/motion/count-up';
import { PageEnter } from '@/components/motion/page-enter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableScroll, Td, Th } from '@/components/ui/table';
import { requireVerifiedUser } from '@/lib/auth/session';
import { listReports, summarize } from '@/lib/data/reports';
import { formatDate, number } from '@/lib/format';
import { riskBand, totalFindings } from '@/lib/types';
import { radiusMd, textSm } from '@/styles/tokens';

export const metadata: Metadata = { title: 'Risk posture' };

const Cols = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 14px;
  align-items: start;

  @media (max-width: 1020px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 14px;
  align-content: start;
`;

const Band = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--aq-border);
  border-radius: ${radiusMd};
  background: var(--aq-card);
  box-shadow:
    var(--aq-shadow-sm),
    inset 0 1px 0 var(--aq-highlight);
`;

const BandLabel = styled.div`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
`;

const BandValue = styled.div`
  font-size: 1.05rem;
  font-weight: 650;
  letter-spacing: -0.02em;
`;

export default async function RiskPage() {
  await requireVerifiedUser();
  const reports = await listReports();
  const summary = summarize(reports);
  const band = riskBand(summary.latestScore);
  const ready = reports.filter((r) => r.status === 'ready');

  return (
    <PageEnter>
      <PageHeader
        eyebrow="Analytics"
        title="Risk posture"
        description="Portfolio-wide exposure across every completed scan in your organisation."
      />

      <Cols>
        <Stack>
          <Card>
            <CardHeader>
              <CardTitle>Score history</CardTitle>
              <CardDescription>Weighted risk per scan; lower is better.</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskTrendChart trend={summary.trend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scan breakdown</CardTitle>
              <CardDescription>Every completed report, newest first.</CardDescription>
            </CardHeader>
            <CardContent style={{ paddingInline: 12 }}>
              {ready.length === 0 ? (
                <p style={{ color: 'var(--aq-muted-fg)', fontSize: textSm, padding: '8px 4px' }}>
                  No completed scans yet.
                </p>
              ) : (
                <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <Th>Report</Th>
                      <Th>Scanned</Th>
                      <Th>Score</Th>
                      <Th>Findings</Th>
                      <Th>Band</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {ready.map((report) => {
                      const rBand = riskBand(report.risk_score);
                      return (
                        <tr key={report.id}>
                          <Td style={{ fontWeight: 540, minWidth: 200 }}>
                            {report.title}
                          </Td>
                          <Td style={{ color: 'var(--aq-muted-fg)' }}>
                            {formatDate(report.scanned_at ?? report.created_at)}
                          </Td>
                          <Td>{report.risk_score ?? '—'}</Td>
                          <Td>{number(totalFindings(report.severity_counts))}</Td>
                          <Td>
                            <Badge tone={rBand.tone === 'low' ? 'success' : rBand.tone}>
                              {rBand.label}
                            </Badge>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                </TableScroll>
              )}
            </CardContent>
          </Card>
        </Stack>

        <Stack>
          <Band>
            <BandLabel>Current band</BandLabel>
            <BandValue>
              <Badge tone={band.tone === 'low' ? 'success' : band.tone}>{band.label}</Badge>
            </BandValue>
          </Band>
          <Band>
            <BandLabel>Latest score</BandLabel>
            <BandValue>
              {summary.latestScore === null ? (
                '—'
              ) : (
                <>
                  <CountUp value={summary.latestScore} /> / 100
                </>
              )}
            </BandValue>
          </Band>
          <Band>
            <BandLabel>Open critical</BandLabel>
            <BandValue
              style={{ color: summary.openCritical > 0 ? 'var(--aq-sev-critical)' : undefined }}
            >
              <CountUp value={summary.openCritical} />
            </BandValue>
          </Band>

          <Card>
            <CardHeader>
              <CardTitle>Severity mix</CardTitle>
              <CardDescription>All findings across all scans.</CardDescription>
            </CardHeader>
            <CardContent>
              <SeverityDonut counts={summary.counts} />
              <SeverityLegend counts={summary.counts} />
            </CardContent>
          </Card>
        </Stack>
      </Cols>
    </PageEnter>
  );
}
