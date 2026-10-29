import type { Metadata } from 'next';
import { styled } from '@yak/react';

import { SeverityDonut, SeverityLegend } from '@/components/charts/severity-donut';
import { RiskTrendChart } from '@/components/charts/risk-trend';
import { CountUp } from '@/components/motion/count-up';
import { PageEnter } from '@/components/motion/page-enter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireVerifiedUser } from '@/lib/auth/session';
import { listReports, summarize } from '@/lib/data/reports';
import { formatDate, number } from '@/lib/format';
import { riskBand, totalFindings } from '@/lib/types';
import { radiusMd, textSm, textXs } from '@/styles/tokens';

export const metadata: Metadata = { title: 'Risk posture' };

const Head = styled.div`
  margin-bottom: 18px;

  & h2 {
    font-size: 1.35rem;
    font-weight: 680;
    letter-spacing: -0.03em;
  }

  & p {
    color: var(--aq-muted-fg);
    font-size: 0.85rem;
    margin-top: 4px;
  }
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 14px;

  @media (max-width: 1020px) {
    grid-template-columns: 1fr;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${textSm};
`;

const Th = styled.th`
  text-align: left;
  font-size: ${textXs};
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--aq-muted-fg);
  padding: 0 12px 10px;
  border-bottom: 1px solid var(--aq-border);
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px 12px;
  border-bottom: 1px solid var(--aq-border);
  font-variant-numeric: tabular-nums;
`;

export default async function RiskPage() {
  await requireVerifiedUser();
  const reports = await listReports();
  const summary = summarize(reports);
  const band = riskBand(summary.latestScore);
  const ready = reports.filter((r) => r.status === 'ready');

  return (
    <PageEnter>
      <Head>
        <h2>Risk posture</h2>
        <p>Portfolio-wide exposure across every completed scan in your organisation.</p>
      </Head>

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
                <Table>
                  <thead>
                    <tr>
                      <Th>Report</Th>
                      <Th>Scanned</Th>
                      <Th>Score</Th>
                      <Th>Finding</Th>
                      <Th>Band</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {ready.map((report) => {
                      const rBand = riskBand(report.risk_score);
                      return (
                        <tr key={report.id}>
                          <Td style={{ fontWeight: 540, fontVariantNumeric: 'normal' }}>
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
