import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';

import { AuditForm } from '@/components/audits/audit-form';
import { DeleteAuditButton } from '@/components/audits/delete-audit-button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { SubmitButton } from '@/components/ui/submit-button';
import { reopenAudit } from '@/lib/audits/actions';
import { getFramework } from '@/lib/audits/frameworks';
import { requireVerifiedUser } from '@/lib/auth/session';
import { getAudit } from '@/lib/data/audits';
import { listReports, summarize } from '@/lib/data/reports';
import { formatDateTime } from '@/lib/format';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  return { title: audit?.title ?? 'Audit' };
}

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, audit] = await Promise.all([requireVerifiedUser(), getAudit(id)]);
  if (!audit) notFound();

  const framework = getFramework(audit.framework);
  const isAdmin = session.profile.role === 'admin';
  const latestRiskScore = summarize(await listReports()).latestScore;
  const completed = audit.status === 'completed';

  return (
    <div>
      <Link
        href="/audits"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.8125rem',
          color: 'var(--aq-muted-fg)',
          marginBottom: 10,
        }}
      >
        <ArrowLeft size={14} /> All audits
      </Link>
      <PageHeader
        eyebrow={framework?.short ?? 'Audit'}
        title={audit.title}
        description={
          completed && audit.completed_at
            ? `Completed ${formatDateTime(audit.completed_at)}`
            : `Last updated ${formatDateTime(audit.updated_at)}`
        }
        actions={
          <>
            <Badge tone={completed ? 'success' : 'info'}>
              {completed ? 'Completed' : 'In progress'}
            </Badge>
            {completed && isAdmin ? (
              <form action={reopenAudit.bind(null, audit.id)}>
                <SubmitButton variant="outline" size="sm" pendingLabel="Reopening…">
                  <RotateCcw size={14} /> Reopen
                </SubmitButton>
              </form>
            ) : null}
            {isAdmin ? <DeleteAuditButton auditId={audit.id} /> : null}
          </>
        }
      />
      <AuditForm
        auditId={audit.id}
        frameworkId={audit.framework}
        initialAnswers={audit.answers ?? {}}
        readOnly={!isAdmin}
        completed={completed}
        latestRiskScore={latestRiskScore}
      />
    </div>
  );
}
