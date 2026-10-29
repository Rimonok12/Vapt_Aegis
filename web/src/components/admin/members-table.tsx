'use client';

import { useTransition } from 'react';
import { ShieldCheck, UserRound } from 'lucide-react';
import { styled } from '@yak/react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableScroll, Td as BaseTd, Th } from '@/components/ui/table';
import { setMemberRole } from '@/lib/admin/actions';
import { formatDate } from '@/lib/format';
import type { ProfileRow } from '@/lib/types';
import { textXs } from '@/styles/tokens';

const Td = styled(BaseTd)`
  vertical-align: middle;
`;

const Name = styled.div`
  font-weight: 560;

  & small {
    display: block;
    font-weight: 400;
    color: var(--aq-muted-fg);
    font-size: ${textXs};
    margin-top: 2px;
  }
`;

export function MembersTable({
  members,
  currentUserId,
}: {
  members: ProfileRow[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [tbodyRef] = useAutoAnimate<HTMLTableSectionElement>({ duration: 260 });

  function changeRole(userId: string, role: 'admin' | 'client') {
    startTransition(async () => {
      const result = await setMemberRole({ userId, role });
      if (result.ok) {
        toast.success(role === 'admin' ? 'Member promoted to administrator.' : 'Member set to client.');
      } else {
        toast.error(result.message ?? 'Could not change the role.');
      }
    });
  }

  return (
    <TableScroll>
    <Table>
      <thead>
        <tr>
          <Th>Member</Th>
          <Th>Role</Th>
          <Th>Identity</Th>
          <Th>Joined</Th>
          <Th> </Th>
        </tr>
      </thead>
      <tbody ref={tbodyRef}>
        {members.map((member) => {
          const isSelf = member.id === currentUserId;
          return (
            <tr key={member.id}>
              <Td>
                <Name>
                  {member.full_name || member.email || 'Unnamed'}
                  <small>{member.email}</small>
                </Name>
              </Td>
              <Td>
                <Badge tone={member.role === 'admin' ? 'primary' : 'neutral'}>
                  {member.role === 'admin' ? 'Administrator' : 'Client'}
                </Badge>
              </Td>
              <Td>
                {member.nid_verified ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--aq-success)',
                    }}
                  >
                    <ShieldCheck size={14} /> Verified
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--aq-muted-fg)',
                    }}
                  >
                    <UserRound size={14} /> Pending NID
                  </span>
                )}
              </Td>
              <Td style={{ color: 'var(--aq-muted-fg)' }}>{formatDate(member.created_at)}</Td>
              <Td style={{ textAlign: 'right' }}>
                {!isSelf && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      changeRole(member.id, member.role === 'admin' ? 'client' : 'admin')
                    }
                  >
                    {member.role === 'admin' ? 'Demote' : 'Make admin'}
                  </Button>
                )}
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
    </TableScroll>
  );
}
