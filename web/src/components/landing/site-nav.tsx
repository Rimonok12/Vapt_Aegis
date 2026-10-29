import Link from 'next/link';
import { styled } from '@yak/react';

import { Brand } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnchorButton } from '@/components/ui/button';
import { shellMax, textSm } from '@/styles/tokens';

const Nav = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(14px);
  background: color-mix(in oklab, var(--aq-bg) 78%, transparent);
  border-bottom: 1px solid var(--aq-border);
`;

const Inner = styled.div`
  max-width: ${shellMax};
  margin-inline: auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 480px) {
    padding-inline: 16px;
    gap: 10px;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  /* The hero repeats "Client sign in", so drop it where the bar would overflow. */
  @media (max-width: 520px) {
    gap: 8px;

    & .aq-nav-signin {
      display: none;
    }
  }

  /* Smallest phones: the theme follows the system setting instead. */
  @media (max-width: 420px) {
    & .aq-nav-theme {
      display: none;
    }
  }
`;

const TextLink = styled(Link)`
  font-size: ${textSm};
  font-weight: 550;
  color: var(--aq-muted-fg);
  padding: 6px 8px;
  border-radius: 8px;
  transition: color 140ms ease;

  &:hover,
  &[aria-current='page'] {
    color: var(--aq-fg);
  }
`;

/** Top bar for the public marketing pages (landing, pricing). */
export function SiteNav({ current }: { current?: 'pricing' }) {
  return (
    <Nav>
      <Inner>
        <Link href="/" style={{ display: 'inline-flex' }}>
          <Brand />
        </Link>
        <Right>
          <TextLink href="/pricing" aria-current={current === 'pricing' ? 'page' : undefined}>
            Pricing
          </TextLink>
          <div className="aq-nav-theme">
            <ThemeToggle />
          </div>
          <AnchorButton href="/signin" variant="ghost" size="sm" className="aq-nav-signin">
            Sign in
          </AnchorButton>
          <AnchorButton href="/signup" size="sm">
            Get started
          </AnchorButton>
        </Right>
      </Inner>
    </Nav>
  );
}
