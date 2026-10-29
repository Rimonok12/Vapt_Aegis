'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';
import { styled } from '@yak/react';

import { Brand } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/actions';
import {
  durationBase,
  easeOut,
  radiusMd,
  sidebarWidth,
  sidebarWidthCollapsed,
  textSm,
} from '@/styles/tokens';

export type NavItem = {
  href: string;
  label: string;
  icon: 'dashboard' | 'reports' | 'risk' | 'uploads' | 'tenants';
  admin?: boolean;
};

export const APP_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/reports', label: 'Reports', icon: 'reports' },
  { href: '/risk', label: 'Risk posture', icon: 'risk' },
  { href: '/admin/uploads', label: 'Upload scan', icon: 'uploads', admin: true },
  { href: '/admin/tenants', label: 'Tenants', icon: 'tenants', admin: true },
];

function NavIcon({ name }: { name: NavItem['icon'] }) {
  switch (name) {
    case 'dashboard':
      return <LayoutDashboard size={16} />;
    case 'reports':
      return <FileText size={16} />;
    case 'risk':
      return <Gauge size={16} />;
    case 'uploads':
      return <Upload size={16} />;
    case 'tenants':
      return <Users size={16} />;
  }
}

const Nav = styled.nav`
  position: fixed;
  inset-block: 0;
  left: 0;
  z-index: 30;
  width: ${sidebarWidth};
  display: flex;
  flex-direction: column;
  background: var(--aq-card);
  border-right: 1px solid var(--aq-border);
  overflow: hidden;
  transition: width ${durationBase} ${easeOut};

  &[data-collapsed='true'] {
    width: ${sidebarWidthCollapsed};
  }

  @media (max-width: 860px) {
    width: ${sidebarWidthCollapsed};
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 14px 10px;

  &[data-collapsed='true'] {
    flex-direction: column;
    gap: 6px;
    padding-inline: 0;
  }
`;

const CollapseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: ${radiusMd};
  color: var(--aq-muted-fg);
  transition:
    background-color 140ms ease,
    color 140ms ease;

  &:hover {
    background: var(--aq-accent);
    color: var(--aq-fg);
  }

  @media (max-width: 860px) {
    display: none;
  }
`;

const Links = styled.div`
  flex: 1;
  padding: 6px 10px;
  display: grid;
  gap: 3px;
  align-content: start;
  overflow-y: auto;
  overflow-x: hidden;

  &[data-collapsed='true'] {
    padding-inline: 12px;
  }
`;

const SectionLabel = styled.p`
  padding: 14px 10px 6px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--aq-muted-fg);

  &[data-collapsed='true'] {
    visibility: hidden;
    height: 8px;
    padding: 0;
  }
`;

const Item = styled(Link)`
  display: flex;
  align-items: center;
  gap: 11px;
  height: 38px;
  padding-inline: 11px;
  border-radius: ${radiusMd};
  font-size: ${textSm};
  font-weight: 520;
  color: var(--aq-muted-fg);
  transition:
    background-color 140ms ${easeOut},
    color 140ms ${easeOut};
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background: var(--aq-accent);
    color: var(--aq-fg);
  }

  &[aria-current='page'] {
    background: var(--aq-primary-soft);
    color: var(--aq-primary);
    font-weight: 600;
  }

  &[data-collapsed='true'] {
    justify-content: center;
    padding-inline: 0;

    & > span {
      display: none;
    }
  }
`;

const Bottom = styled.div`
  padding: 12px 14px;
  border-top: 1px solid var(--aq-border);
  display: grid;
  gap: 12px;
  justify-items: stretch;

  &[data-collapsed='true'] {
    padding-inline: 12px;
    justify-items: center;
  }
`;

const Frame = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  margin-left: ${sidebarWidthCollapsed};
  transition: margin-left ${durationBase} ${easeOut};

  @media (min-width: 861px) {
    margin-left: ${sidebarWidth};
  }

  &[data-collapsed='true'] {
    @media (min-width: 861px) {
      margin-left: ${sidebarWidthCollapsed};
    }
  }
`;

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 58px;
  padding-inline: 22px;
  background: color-mix(in oklab, var(--aq-bg) 82%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--aq-border);
`;

const Org = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: ${textSm};
  font-weight: 600;

  & svg {
    color: var(--aq-primary);
  }

  & em {
    font-style: normal;
    color: var(--aq-muted-fg);
    font-weight: 480;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 24px 22px 48px;
`;

export function AppShell({
  children,
  email,
  organization,
  role,
}: {
  children: ReactNode;
  email: string | null;
  organization: string | null;
  role: 'client' | 'admin';
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const visible = APP_NAV.filter((item) => !item.admin || role === 'admin');
  const clientItems = visible.filter((item) => !item.admin);
  const adminItems = visible.filter((item) => item.admin);

  const isCollapsed = collapsed;

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <Nav data-collapsed={isCollapsed}>
        <Top data-collapsed={isCollapsed}>
          <Brand size={18} />
          <CollapseButton
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </CollapseButton>
        </Top>

        <Links data-collapsed={isCollapsed}>
          <SectionLabel data-collapsed={isCollapsed}>Workspace</SectionLabel>
          {clientItems.map((item) => (
            <Item
              key={item.href}
              href={item.href}
              data-collapsed={isCollapsed}
              title={item.label}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Item>
          ))}

          {adminItems.length > 0 ? (
            <>
              <SectionLabel data-collapsed={isCollapsed}>Administration</SectionLabel>
              {adminItems.map((item) => (
                <Item
                  key={item.href}
                  href={item.href}
                  data-collapsed={isCollapsed}
                  title={item.label}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </Item>
              ))}
            </>
          ) : null}
        </Links>

        <Bottom data-collapsed={isCollapsed}>
          <ThemeToggle />
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit" title="Sign out">
              <LogOut size={15} />
              {!collapsed && 'Sign out'}
            </Button>
          </form>
        </Bottom>
      </Nav>

      <Frame data-collapsed={isCollapsed}>
        <Topbar>
          <Org>
            <ShieldCheck size={15} />
            {organization ?? 'Personal workspace'}
            <em>· {role === 'admin' ? 'Administrator' : 'Client'}</em>
          </Org>
          <span style={{ fontSize: textSm, color: 'var(--aq-muted-fg)' }}>{email}</span>
        </Topbar>
        <Content>
          <div key={pathname} className="aq-enter">
            {children}
          </div>
        </Content>
      </Frame>
    </>
  );
}
