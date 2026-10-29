import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, FileText, Gauge, ShieldCheck } from 'lucide-react';
import { styled } from '@yak/react';

import { RiskTrendChart } from '@/components/charts/risk-trend';
import { SeverityDonut, SeverityLegend } from '@/components/charts/severity-donut';
import { CountUp } from '@/components/motion/count-up';
import { MotionList } from '@/components/motion/motion-list';
import { PageEnter } from '@/components/motion/page-enter';
import { ReportCard } from '@/components/reports/report-card';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
} from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { listReports, summarize } from '@/lib/data/reports';
import { number } from '@/lib/format';
import { riskBand } from '@/lib/types';
import { requireVerifiedUser } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Dashboard' };

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 14px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  & h2 {
    font-size: 1.35rem;
    font-weight: 680;
    letter-spacing: -0.03em;
  }
`;

const LinkAll = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 550;
  color: var(--aq-primary);

  &:hover {
    text-decoration: underline;
  }
`;


const Delta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--aq-muted-fg);

  &[data-tone='good'] {
    color: var(--aq-success);
  }

  &[data-tone='bad'] {
    color: var(--aq-destructive);
  }
`;

export default async function DashboardPage() {
  const session = await requireVerifiedUser();
  const reports = await listReports();
  const summary = summarize(reports);

  const band = riskBand(summary.latestScore);
  const recent = reports.slice(0, 6);
  const deltaTone =
    summary.scoreDelta == null || summary.scoreDelta === 0
      ? 'flat'
      : summary.scoreDelta < 0
        ? 'good'
        : 'bad';

  return (
    <PageEnter style={{ display: 'grid', gap: 18 }}>
      <PageHeader
        eyebrow="Overview"
        title="Risk overview"
        description={`${session.organization?.name ?? 'Your workspace'} · ${summary.readyReports} completed report${summary.readyReports === 1 ? '' : 's'}`}
        actions={
          <LinkAll href="/reports">
            All reports <ArrowRight size={13} />
          </LinkAll>
        }
      />

      <Grid>
        <StatCard
          label="Current risk score"
          value={summary.latestScore === null ? '—' : <CountUp value={summary.latestScore} />}
          tone={band.tone === 'low' ? 'success' : band.tone}
          icon={<Gauge size={15} />}
          hint={
            summary.scoreDelta != null ? (
              <>
                <Delta data-tone={deltaTone}>
                  {summary.scoreDelta > 0 ? '+' : ''}
                  {summary.scoreDelta}
                </Delta>
                since previous scan
              </>
            ) : (
              band.label
            )
          }
        />
        <StatCard
          label="Open critical"
          value={<CountUp value={summary.openCritical} />}
          tone={summary.openCritical > 0 ? 'critical' : 'success'}
          icon={<AlertTriangle size={15} />}
          hint={summary.openCritical > 0 ? 'Remediate first' : 'Nothing critical outstanding'}
        />
        <StatCard
          label="Total findings"
          value={
            <CountUp
              value={
                summary.counts.critical +
                summary.counts.high +
                summary.counts.medium +
                summary.counts.low +
                summary.counts.info
              }
            />
          }
          icon={<FileText size={15} />}
          hint={`across ${number(summary.assets)} assets`}
        />
        <StatCard
          label="In processing"
          value={<CountUp value={summary.processing} />}
          tone={summary.processing > 0 ? 'default' : 'success'}
          icon={<ShieldCheck size={15} />}
          hint={
            summary.processing > 0
              ? 'AI drafting in progress'
              : summary.failed > 0
                ? `${summary.failed} failed upload${summary.failed === 1 ? '' : 's'}`
                : 'Pipeline clear'
          }
        />
      </Grid>

      <TwoCol>
        <Card>
          <CardHeader>
            <CardTitle>Risk trend</CardTitle>
            <CardDescription>Risk score across completed scans (lower is better).</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskTrendChart trend={summary.trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity mix</CardTitle>
            <CardDescription>All findings in your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <SeverityDonut counts={summary.counts} />
            <SeverityLegend counts={summary.counts} />
          </CardContent>
        </Card>
      </TwoCol>

      <div>
        <HeaderRow style={{ marginBottom: 14, marginTop: 8 }}>
          <h2 style={{ fontSize: '1.1rem' }}>Recent reports</h2>
          <LinkAll href="/reports">
            View all <ArrowRight size={13} />
          </LinkAll>
        </HeaderRow>

        {recent.length === 0 ? (
          <Card style={{ padding: 32, textAlign: 'center', alignItems: 'center' }}>
            <Badge tone="primary" style={{ marginBottom: 10 }}>
              No reports yet
            </Badge>
            <p
              style={{
                color: 'var(--aq-muted-fg)',
                fontSize: '0.85rem',
                maxWidth: '46ch',
                margin: '0 auto',
              }}
            >
              Once an administrator uploads a scan, sanitised results and an AI-drafted executive
              report will appear here.
            </p>
          </Card>
        ) : (
          <MotionList className="aq-cols-cards">
            {recent.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </MotionList>
        )}
      </div>
    </PageEnter>
  );
}
