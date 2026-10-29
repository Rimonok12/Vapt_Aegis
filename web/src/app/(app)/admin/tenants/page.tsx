import type { Metadata } from 'next';
import { styled } from '@yak/react';

import { MembersTable } from '@/components/admin/members-table';
import { PageEnter } from '@/components/motion/page-enter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { requireAdmin } from '@/lib/auth/session';
import { listMembers, listOrganizationStats } from '@/lib/data/members';
import { number } from '@/lib/format';

export const metadata: Metadata = { title: 'Tenants' };

const Stats = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
`;

async function TenantContent({
  organizationId,
  organizationName,
  currentUserId,
}: {
  organizationId: string;
  organizationName: string;
  currentUserId: string;
}) {
  const [members, stats] = await Promise.all([
    listMembers(organizationId),
    listOrganizationStats(organizationId),
  ]);

  return (
    <>
      <Stats>
        <Badge tone="neutral">{number(stats.members)} members</Badge>
        <Badge tone={stats.verified === stats.members ? 'success' : 'warning'}>
          {number(stats.verified)} NID verified
        </Badge>
        <Badge tone="outline">{number(stats.reports)} reports</Badge>
      </Stats>

      <Card>
        <CardHeader>
          <CardTitle>{organizationName}</CardTitle>
          <CardDescription>
            Everyone who can sign in to this workspace. National ID verification is required before
            any report data becomes visible.
          </CardDescription>
        </CardHeader>
        <CardContent style={{ paddingInline: 12 }}>
          <MembersTable members={members} currentUserId={currentUserId} />
        </CardContent>
      </Card>
    </>
  );
}

export default async function TenantsPage() {
  const session = await requireAdmin();
  const organizationId = session.profile.organization_id;

  return (
    <PageEnter>
      <PageHeader
        eyebrow="Administration"
        title="Tenants & members"
        description="Your dedicated organisation and the people who can access it."
      />

      {!organizationId ? (
        <Card
          style={{
            padding: 26,
            textAlign: 'center',
            color: 'var(--aq-muted-fg)',
            fontSize: '0.87rem',
          }}
        >
          Your account is not attached to an organisation yet. Sign out and sign up again, or
          contact the platform operator.
        </Card>
      ) : (
        <TenantContent
          organizationId={organizationId}
          organizationName={session.organization?.name ?? 'Your organisation'}
          currentUserId={session.userId}
        />
      )}
    </PageEnter>
  );
}
