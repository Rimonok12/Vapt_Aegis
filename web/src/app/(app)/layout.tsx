import { Suspense } from 'react';
import { styled } from '@yak/react';

import { AppShell } from '@/components/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { requireVerifiedUser } from '@/lib/auth/session';
import { sidebarWidth } from '@/styles/tokens';

const Frame = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  margin-left: ${sidebarWidth};
`;

function ShellFallback() {
  return (
    <Frame>
      <div
        style={{
          height: 58,
          borderBottom: '1px solid var(--aq-border)',
          display: 'flex',
          alignItems: 'center',
          paddingInline: 22,
        }}
      >
        <Skeleton style={{ height: 16, width: 220 }} />
      </div>
      <div style={{ padding: '24px 22px 48px', display: 'grid', gap: 14 }}>
        <Skeleton style={{ height: 26, width: 200 }} />
        <Skeleton style={{ height: 220, borderRadius: 14 }} />
        <Skeleton style={{ height: 220, borderRadius: 14 }} />
      </div>
    </Frame>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const session = await requireVerifiedUser();

  return (
    <AppShell
      email={session.email}
      organization={session.organization?.name ?? null}
      role={session.profile.role}
    >
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
