import Link from 'next/link';
import { styled } from '@yak/react';

import { Brand } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { space8 } from '@/styles/tokens';

const Wrap = styled.main`
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 900px) {
    grid-template-columns: 1.05fr 1fr;
  }
`;

const Aside = styled.section`
  position: relative;
  display: none;
  padding: ${space8};
  background: var(--aq-bg);
  overflow: hidden;

  @media (min-width: 900px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
  }
`;

const AsideInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 520px;
`;

const Headline = styled.h1`
  font-size: 2.5rem;
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.035em;
  margin-top: 28px;
`;

const Lead = styled.p`
  margin-top: 16px;
  font-size: 1rem;
  color: var(--aq-muted-fg);
  line-height: 1.6;
  max-width: 44ch;
`;

const Points = styled.ul`
  margin-top: 28px;
  display: grid;
  gap: 12px;
`;

const Point = styled.li`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.9rem;
  color: var(--aq-fg);

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    margin-top: 7px;
    border-radius: 999px;
    background: var(--aq-primary);
    flex: none;
  }
`;

const Panel = styled.section`
  display: flex;
  flex-direction: column;
  padding: 24px 20px 32px;
  background: var(--aq-card);

  @media (min-width: 900px) {
    padding: 28px 40px;
    justify-content: center;
    border-left: 1px solid var(--aq-border);
    box-shadow: -24px 0 60px -40px oklch(0 0 0 / 0.35);
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
`;

const Centered = styled.div`
  width: 100%;
  max-width: 420px;
  margin-inline: auto;
`;

const Bottom = styled.div`
  margin-top: 26px;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--aq-muted-fg);

  & a {
    color: var(--aq-primary);
    font-weight: 550;
  }
`;

const Grid = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(to right, var(--aq-grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--aq-grid) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 90% 60% at 30% 20%, #000 30%, transparent 75%);
`;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Wrap>
      <Aside>
        <Grid />
        <div
          aria-hidden
          className="aq-orb"
          data-i="0"
          style={{ top: '-10%', left: '6%', width: 340, height: 340 }}
        />
        <div
          aria-hidden
          className="aq-orb"
          data-i="1"
          style={{ bottom: '-8%', right: '2%', width: 300, height: 300 }}
        />
        <AsideInner className="aq-enter">
          <Brand size={26} />
          <Headline>Turn raw scan data into board-ready risk reports.</Headline>
          <Lead>
            Aegis ingests Nessus and Nmap output, sanitises every finding, and drafts an executive
            summary with a local AI model — then gates access behind National ID verification.
          </Lead>
          <Points>
            <Point>IPs, hostnames and credentials stripped before storage</Point>
            <Point>Per-tenant isolation enforced by row-level security</Point>
            <Point>One-time National ID (Porichoy) check per person</Point>
            <Point>Exportable, print-ready PDF reports</Point>
          </Points>
        </AsideInner>
      </Aside>

      <Panel>
        <TopBar>
          <Link href="/" style={{ display: 'inline-flex' }}>
            <Brand />
          </Link>
          <ThemeToggle />
        </TopBar>
        <Centered className="aq-enter">{children}</Centered>
        <Bottom>
          <Link href="/">← Back to home</Link>
        </Bottom>
      </Panel>
    </Wrap>
  );
}
