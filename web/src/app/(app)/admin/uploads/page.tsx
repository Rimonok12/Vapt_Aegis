import type { Metadata } from 'next';
import { styled } from '@yak/react';

import { UploadForm } from '@/components/admin/upload-form';
import { MotionList } from '@/components/motion/motion-list';
import { PageEnter } from '@/components/motion/page-enter';
import { ReportCard } from '@/components/reports/report-card';
import { PageHeader } from '@/components/ui/page-header';
import { requireAdmin } from '@/lib/auth/session';
import { listReports } from '@/lib/data/reports';

export const metadata: Metadata = { title: 'Upload scan' };

const Sub = styled.h3`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--aq-muted-fg);
  margin-top: 30px;
  margin-bottom: 4px;
`;


async function RecentUploads() {
  const reports = await listReports();
  const recent = reports.slice(0, 4);
  if (recent.length === 0) return null;

  return (
    <>
      <Sub>Recent uploads</Sub>
      <MotionList className="aq-cols-cards" style={{ marginTop: 14 }}>
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
      <PageHeader
        eyebrow="Administration"
        title="Upload scan"
        description="Submit a raw vulnerability scan for sanitisation and AI drafting."
      />
      <UploadForm />
      <RecentUploads />
    </PageEnter>
  );
}
