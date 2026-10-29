'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardCheck,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Upload,
  Users,
  X,
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
  shellMax,
  sidebarWidth,
  sidebarWidthCollapsed,
  textSm,
  textXs,
} from '@/styles/tokens';

export type NavItem = {
  href: string;
  label: string;
  icon: 'dashboard' | 'reports' | 'risk' | 'audits' | 'uploads' | 'tenants';
  admin?: boolean;
};

export const APP_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/reports', label: 'Reports', icon: 'reports' },
  { href: '/risk', label: 'Risk posture', icon: 'risk' },
  { href: '/audits', label: 'IT audits', icon: 'audits' },
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
    case 'audits':
      return <ClipboardCheck size={16} />;
    case 'uploads':
      return <Upload size={16} />;
    case 'tenants':
      return <Users size={16} />;
  }
}

/*
 * Layout modes (all CSS, so the server render is already correct):
 *   > 1024px   full sidebar; the user may collapse it to an icon rail
 *   721–1024px icon rail only
 *   <= 720px   off-canvas drawer opened from the top bar
 * "Rail" styling is written once per component under both the
 * [data-collapsed='true'] attribute and the tablet media query.
 */
const TABLET = '@media (min-width: 721px) and (max-width: 1024px)';
const PHONE = '@media (max-width: 720px)';

const Nav = styled.nav`
  position: fixed;
  inset-block: 0;
  left: 0;
  z-index: 40;
  width: ${sidebarWidth};
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--aq-primary) 5%, transparent), transparent 220px),
    var(--aq-card);
  border-right: 1px solid var(--aq-border);
  overflow: hidden;
  transition:
    width ${durationBase} ${easeOut},
    transform 260ms ${easeOut},
    box-shadow 260ms ${easeOut};

  &[data-collapsed='true'] {
    width: ${sidebarWidthCollapsed};
  }

  ${TABLET} {
    width: ${sidebarWidthCollapsed};
  }

  ${PHONE} {
    width: min(${sidebarWidth}, 84vw);
    transform: translateX(-100%);

    &[data-collapsed='true'] {
      width: min(${sidebarWidth}, 84vw);
    }

    &[data-open='true'] {
      transform: none;
      box-shadow: var(--aq-shadow-xl);
    }
  }
`;

const Backdrop = styled.div`
  display: none;

  ${PHONE} {
    position: fixed;
    inset: 0;
    z-index: 35;
    background: oklch(0.1 0.02 258 / 0.5);
    backdrop-filter: blur(2px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 220ms ease;

    &[data-open='true'] {
      display: block;
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 14px 12px;

  &[data-collapsed='true'] {
    flex-direction: column;
    gap: 8px;
    padding-inline: 0;

    & .aq-brand-name {
      display: none;
    }
  }

  ${TABLET} {
    flex-direction: column;
    gap: 8px;
    padding-inline: 0;

    & .aq-brand-name {
      display: none;
    }
  }

  ${PHONE} {
    &[data-collapsed='true'] {
      flex-direction: row;
      padding-inline: 14px;

      & .aq-brand-name {
        display: inline;
      }
    }
  }
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: ${radiusMd};
  color: var(--aq-muted-fg);
  transition:
    background-color 140ms ease,
    color 140ms ease;

  &:hover {
    background: var(--aq-accent);
    color: var(--aq-fg);
  }

  &[data-only='desktop'] {
    ${TABLET} {
      display: none;
    }
    ${PHONE} {
      display: none;
    }
  }

  &[data-only='phone'] {
    display: none;

    ${PHONE} {
      display: inline-flex;
    }
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

  ${TABLET} {
    padding-inline: 12px;
  }

  ${PHONE} {
    &[data-collapsed='true'] {
      padding-inline: 10px;
    }
  }
`;

const SectionLabel = styled.p`
  padding: 16px 11px 6px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--aq-muted-fg);
  white-space: nowrap;

  &[data-collapsed='true'] {
    visibility: hidden;
    height: 10px;
    padding: 0;
  }

  ${TABLET} {
    visibility: hidden;
    height: 10px;
    padding: 0;
  }

  ${PHONE} {
    &[data-collapsed='true'] {
      visibility: visible;
      height: auto;
      padding: 16px 11px 6px;
    }
  }
`;

const Item = styled(Link)`
  position: relative;
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

  & svg {
    flex: none;
  }

  &:hover {
    background: var(--aq-accent);
    color: var(--aq-fg);
  }

  &[aria-current='page'] {
    background: var(--aq-primary-soft);
    color: var(--aq-primary);
    font-weight: 600;
  }

  /* Active indicator bar on the sidebar edge. */
  &[aria-current='page']::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--aq-primary);
  }

  &[data-collapsed='true'] {
    justify-content: center;
    padding-inline: 0;

    & > span {
      display: none;
    }

    &[aria-current='page']::before {
      left: -12px;
    }
  }

  ${TABLET} {
    justify-content: center;
    padding-inline: 0;

    & > span {
      display: none;
    }

    &[aria-current='page']::before {
      left: -12px;
    }
  }

  ${PHONE} {
    &[data-collapsed='true'] {
      justify-content: flex-start;
      padding-inline: 11px;

      & > span {
        display: inline;
      }

      &[aria-current='page']::before {
        left: -10px;
      }
    }
  }
`;

const Bottom = styled.div`
  padding: 12px 14px 14px;
  border-top: 1px solid var(--aq-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  & .aq-theme-compact {
    display: none;
  }

  &[data-collapsed='true'] {
    flex-direction: column;
    padding-inline: 0;

    & .aq-theme-full,
    & .aq-signout-label {
      display: none;
    }

    & .aq-theme-compact {
      display: block;
    }
  }

  ${TABLET} {
    flex-direction: column;
    padding-inline: 0;

    & .aq-theme-full,
    & .aq-signout-label {
      display: none;
    }

    & .aq-theme-compact {
      display: block;
    }
  }

  ${PHONE} {
    &[data-collapsed='true'] {
      flex-direction: row;
      padding-inline: 14px;

      & .aq-theme-full {
        display: block;
      }

      & .aq-signout-label {
        display: inline;
      }

      & .aq-theme-compact {
        display: none;
      }
    }
  }
`;

const Frame = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  margin-left: ${sidebarWidth};
  transition: margin-left ${durationBase} ${easeOut};

  &[data-collapsed='true'] {
    margin-left: ${sidebarWidthCollapsed};
  }

  ${TABLET} {
    margin-left: ${sidebarWidthCollapsed};
  }

  ${PHONE} {
    margin-left: 0;

    &[data-collapsed='true'] {
      margin-left: 0;
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
  height: 60px;
  padding-inline: 28px;
  background: color-mix(in oklab, var(--aq-bg) 78%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  border-bottom: 1px solid var(--aq-border);

  ${PHONE} {
    padding-inline: 12px 16px;
  }
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const Org = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  font-size: ${textSm};
  font-weight: 600;

  & > svg {
    color: var(--aq-primary);
    flex: none;
  }

  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & em {
    font-style: normal;
    color: var(--aq-muted-fg);
    font-weight: 480;
  }

  ${PHONE} {
    & em {
      display: none;
    }
  }
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-size: ${textSm};
  color: var(--aq-muted-fg);

  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 260px;
  }

  @media (max-width: 860px) {
    & > span {
      display: none;
    }
  }
`;

const Avatar = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: ${textXs};
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--aq-primary-fg);
  background: linear-gradient(140deg, var(--aq-primary), #00b2c4);
  box-shadow:
    0 0 0 2px var(--aq-card),
    0 0 0 3px var(--aq-border);
`;

const Content = styled.main`
  flex: 1;
  width: 100%;
  max-width: ${shellMax};
  margin-inline: auto;
  padding: 28px 28px 64px;

  ${PHONE} {
    padding: 20px 16px 48px;
  }
`;

function initials(email: string | null): string {
  const name = (email ?? '').split('@')[0] ?? '';
  const parts = name.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase() || 'A';
}

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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const visible = APP_NAV.filter((item) => !item.admin || role === 'admin');
  const clientItems = visible.filter((item) => !item.admin);
  const adminItems = visible.filter((item) => item.admin);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function renderItem(item: NavItem) {
    return (
      <Item
        key={item.href}
        href={item.href}
        data-collapsed={collapsed}
        title={item.label}
        aria-current={isActive(item.href) ? 'page' : undefined}
        onClick={() => setOpen(false)}
      >
        <NavIcon name={item.icon} />
        <span>{item.label}</span>
      </Item>
    );
  }

  return (
    <div className="aq-app-bg" style={{ minHeight: '100dvh' }}>
      <Backdrop data-open={open} onClick={() => setOpen(false)} aria-hidden />
      <Nav data-collapsed={collapsed} data-open={open} aria-label="Main navigation">
        <Top data-collapsed={collapsed}>
          <Link href="/dashboard" onClick={() => setOpen(false)} style={{ display: 'inline-flex' }}>
            <Brand size={18} />
          </Link>
          <IconButton
            type="button"
            data-only="desktop"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </IconButton>
          <IconButton
            type="button"
            data-only="phone"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </IconButton>
        </Top>

        <Links data-collapsed={collapsed}>
          <SectionLabel data-collapsed={collapsed}>Workspace</SectionLabel>
          {clientItems.map(renderItem)}

          {adminItems.length > 0 ? (
            <>
              <SectionLabel data-collapsed={collapsed}>Administration</SectionLabel>
              {adminItems.map(renderItem)}
            </>
          ) : null}
        </Links>

        <Bottom data-collapsed={collapsed}>
          <div className="aq-theme-full">
            <ThemeToggle />
          </div>
          <div className="aq-theme-compact">
            <ThemeToggle compact />
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit" title="Sign out">
              <LogOut size={15} />
              <span className="aq-signout-label">Sign out</span>
            </Button>
          </form>
        </Bottom>
      </Nav>

      <Frame data-collapsed={collapsed}>
        <Topbar>
          <TopLeft>
            <IconButton
              type="button"
              data-only="phone"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={18} />
            </IconButton>
            <Org>
              <ShieldCheck size={15} />
              <span>{organization ?? 'Personal workspace'}</span>
              <em>· {role === 'admin' ? 'Administrator' : 'Client'}</em>
            </Org>
          </TopLeft>
          <User title={email ?? undefined}>
            <span>{email}</span>
            <Avatar aria-hidden>{initials(email)}</Avatar>
          </User>
        </Topbar>
        <Content>
          <div key={pathname} className="aq-enter">
            {children}
          </div>
        </Content>
      </Frame>
    </div>
  );
}
