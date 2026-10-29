import type { Metadata } from 'next';
import { styled } from '@yak/react';

import { MotionList } from '@/components/motion/motion-list';
import { PageEnter } from '@/components/motion/page-enter';
import { ReportCard } from '@/components/reports/report-card';
import { Skeleton } from '@/components/ui/skeleton';
import { listReports } from '@/lib/data/reports';

export const metadata: Metadata = { title: 'Reports' };

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
`;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 14,
} as const;

const Empty = styled.div`
  border: 1px dashed var(--aq-border-strong);
  border-radius: 14px;
  padding: 44px 24px;
  text-align: center;
  color: var(--aq-muted-fg);
  font-size: 0.85rem;
  max-width: 52ch;
  margin: 0 auto;
`;

async function ReportsContent() {
  const reports = await listReports();

  if (reports.length === 0) {
    return (
      <Empty>
        No scans have been uploaded to this workspace yet. When an administrator submits a Nessus,
        Nmap or JSON export, it will appear here once parsing and AI drafting complete.
      </Empty>
    );
  }

  return (
    <MotionList style={gridStyle}>
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </MotionList>
  );
}

export default function ReportsPage() {
  return (
    <PageEnter>
      <Head>
        <h2>All reports</h2>
        <p>Every scan uploaded to your organisation, newest first.</p>
      </Head>
      <ReportsContent />
    </PageEnter>
  );
}

export function ReportsLoading() {
  return (
    <Grid>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} style={{ height: 168, borderRadius: 14 }} />
      ))}
    </Grid>
  );
}
