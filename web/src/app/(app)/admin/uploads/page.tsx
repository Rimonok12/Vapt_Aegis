import type { Metadata } from 'next';
import { styled } from '@yak/react';

import { UploadForm } from '@/components/admin/upload-form';
import { MotionList } from '@/components/motion/motion-list';
import { PageEnter } from '@/components/motion/page-enter';
import { ReportCard } from '@/components/reports/report-card';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/session';
import { getPlanUsage } from '@/lib/data/plan';
import { listReports } from '@/lib/data/reports';

export const metadata: Metadata = { title: 'Upload scan' };

const QuotaNotice = styled.div`
  display: grid;
  gap: 4px;
  max-width: 680px;
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid color-mix(in oklab, var(--aq-warning) 45%, transparent);
  background: color-mix(in oklab, var(--aq-warning) 12%, transparent);
  font-size: 0.85rem;

  & a {
    color: var(--aq-primary);
    font-weight: 600;
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
  const session = await requireAdmin();
  const usage = session.profile.organization_id
    ? await getPlanUsage(session.profile.organization_id)
    : null;

  return (
    <PageEnter>
      <PageHeader
        eyebrow="Administration"
        title="Upload scan"
        description="Submit a raw vulnerability scan for sanitisation and AI drafting."
        actions={
          usage ? (
            <Badge tone={usage.canUpload ? 'primary' : 'warning'}>
              {usage.plan.name} ·{' '}
              {usage.limit === null
                ? 'unlimited reports'
                : `${usage.used} / ${usage.limit} reports${usage.plan.reportLimitPeriod === 'month' ? ' this month' : ''}`}
            </Badge>
          ) : null
        }
      />
      {usage && !usage.canUpload ? (
        <QuotaNotice>
          <strong>You&apos;ve used every report on the {usage.plan.name} plan.</strong>
          <span>
            Upgrade to keep uploading scans.{' '}
            <Link href="/pricing">See plans and prices →</Link>
          </span>
        </QuotaNotice>
      ) : null}
      <UploadForm />
      <RecentUploads />
    </PageEnter>
  );
}
