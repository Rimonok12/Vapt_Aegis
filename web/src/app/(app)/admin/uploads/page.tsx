import type { Metadata } from 'next';
import { styled } from '@yak/react';

import { UploadForm } from '@/components/admin/upload-form';
import { MotionList } from '@/components/motion/motion-list';
import { PageEnter } from '@/components/motion/page-enter';
import { ReportCard } from '@/components/reports/report-card';
import { requireAdmin } from '@/lib/auth/session';
import { listReports } from '@/lib/data/reports';

export const metadata: Metadata = { title: 'Upload scan' };

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

const Sub = styled.h3`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--aq-muted-fg);
  margin-top: 30px;
  margin-bottom: 4px;
`;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 14,
  marginTop: 14,
} as const;

async function RecentUploads() {
  const reports = await listReports();
  const recent = reports.slice(0, 4);
  if (recent.length === 0) return null;

  return (
    <>
      <Sub>Recent uploads</Sub>
      <MotionList style={gridStyle}>
        {recent.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </MotionList>
    </>
  );
}

export default async function UploadsPage() {
  await requireAdmin();

  return (
    <PageEnter>
      <Head>
        <h2>Upload scan</h2>
        <p>Submit a raw vulnerability scan for sanitisation and AI drafting.</p>
      </Head>
      <UploadForm />
      <RecentUploads />
    </PageEnter>
  );
}
