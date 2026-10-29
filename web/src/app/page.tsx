import { Suspense } from 'react';
import { styled } from '@yak/react';

import { Brand } from '@/components/brand';
import { LandingHero } from '@/components/landing/hero';
import { Reveal } from '@/components/motion/reveal';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnchorButton } from '@/components/ui/button';
import { getSession } from '@/lib/auth/session';
import { easeOut, radiusLg, radiusMd, shellMax, space8, textLg, textSm } from '@/styles/tokens';

import { redirect } from 'next/navigation';

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
  @media (max-width: 480px) {
    gap: 8px;

    & .aq-nav-signin {
      display: none;
    }
  }
`;

const Section = styled.section`
  max-width: ${shellMax};
  margin-inline: auto;
  padding: ${space8} 20px 96px;
  display: grid;
  gap: 34px;
`;

const Kicker = styled.p`
  font-size: 0.78rem;
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--aq-primary);
`;

const H2 = styled.h2`
  font-size: clamp(1.6rem, 3.4vw, 2.1rem);
  letter-spacing: -0.035em;
  font-weight: 680;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
`;

const Feature = styled.div`
  border: 1px solid var(--aq-border);
  border-radius: ${radiusLg};
  background: var(--aq-card);
  padding: 22px;
  display: grid;
  gap: 10px;
  transition:
    border-color 200ms ${easeOut},
    box-shadow 200ms ${easeOut};

  &:hover {
    border-color: var(--aq-border-strong);
    box-shadow: var(--aq-shadow-md);
  }
`;

const FeatureIcon = styled.div`
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${radiusMd};
  background: var(--aq-primary-soft);
  color: var(--aq-primary);
`;

const FeatureTitle = styled.h3`
  font-size: ${textLg};
  font-weight: 620;
  letter-spacing: -0.02em;
`;

const FeatureBody = styled.p`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
  line-height: 1.55;
`;

const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  counter-reset: step;
`;

const Step = styled.li`
  position: relative;
  border: 1px dashed var(--aq-border-strong);
  border-radius: ${radiusLg};
  padding: 20px;
  display: grid;
  gap: 8px;

  &::before {
    counter-increment: step;
    content: '0' counter(step);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--aq-primary);
    letter-spacing: 0.08em;
  }
`;

const Footer = styled.footer`
  border-top: 1px solid var(--aq-border);
  padding: 26px 20px;

  & > div {
    max-width: ${shellMax};
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    font-size: ${textSm};
    color: var(--aq-muted-fg);
  }
`;

/**
 * Signed-in visitors bounce straight to the app. Wrapped in Suspense so the
 * cookie read doesn't block prerendering of the static marketing page.
 */
async function SessionRedirect() {
  const session = await getSession();
  if (session) {
    redirect(session.profile.nid_verified ? '/dashboard' : '/verify');
  }
  return null;
}

export default function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <SessionRedirect />
      </Suspense>
      <Nav>
        <Inner>
          <Brand />
          <Right>
            <ThemeToggle />
            <AnchorButton href="/signin" variant="ghost" size="sm" className="aq-nav-signin">
              Sign in
            </AnchorButton>
            <AnchorButton href="/signup" size="sm">
              Get started
            </AnchorButton>
          </Right>
        </Inner>
      </Nav>

      <LandingHero />

      <Section>
        <Reveal>
          <Kicker>Why Aegis</Kicker>
          <H2>Built for security teams who hand reports to executives, not just scanners.</H2>
        </Reveal>
        <Reveal stagger={0.09}>
          <Grid>
            <Feature data-reveal-item>
              <FeatureIcon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </FeatureIcon>
              <FeatureTitle>Sanitise first, store second</FeatureTitle>
              <FeatureBody>
                IPs, hostnames, credentials and network topology are stripped by the parser before
                anything touches the database. Clients see risk, never reconnaissance data.
              </FeatureBody>
            </Feature>
            <Feature data-reveal-item>
              <FeatureIcon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </FeatureIcon>
              <FeatureTitle>National ID gateway</FeatureTitle>
              <FeatureBody>
                Every client passes a one-time Porichoy verification. The NID itself is never
                persisted — only a boolean flag on the profile.
              </FeatureBody>
            </Feature>
            <Feature data-reveal-item>
              <FeatureIcon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  <circle cx="12" cy="12" r="5" />
                </svg>
              </FeatureIcon>
              <FeatureTitle>Local AI, no data resale</FeatureTitle>
              <FeatureBody>
                Reports are drafted by a Llama 3.2 model running on your own Ollama instance.
                Nothing is sent to third-party AI providers.
              </FeatureBody>
            </Feature>
            <Feature data-reveal-item>
              <FeatureIcon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 15h6M9 11h2" />
                </svg>
              </FeatureIcon>
              <FeatureTitle>Executive-ready PDFs</FeatureTitle>
              <FeatureBody>
                One-click export with risk score, severity breakdown, remediation roadmap and
                compliance posture — formatted for the boardroom.
              </FeatureBody>
            </Feature>
          </Grid>
        </Reveal>
      </Section>

      <Section style={{ paddingTop: 0 }}>
        <Reveal>
          <Kicker>How it works</Kicker>
          <H2>From scanner export to signed-off report in four steps.</H2>
        </Reveal>
        <Reveal stagger={0.1}>
          <Steps>
            <Step data-reveal-item>
              <FeatureTitle>Admin uploads scan</FeatureTitle>
              <FeatureBody>
                .nessus, Nmap XML or JSON — dropped straight from the scanner.
              </FeatureBody>
            </Step>
            <Step data-reveal-item>
              <FeatureTitle>Parser sanitises</FeatureTitle>
              <FeatureBody>Findings are normalised, secrets stripped, assets counted.</FeatureBody>
            </Step>
            <Step data-reveal-item>
              <FeatureTitle>AI drafts the report</FeatureTitle>
              <FeatureBody>
                Ollama writes the executive summary and remediation plan as strict JSON.
              </FeatureBody>
            </Step>
            <Step data-reveal-item>
              <FeatureTitle>Client verifies & views</FeatureTitle>
              <FeatureBody>
                After a one-time Porichoy check, the report unlocks in the portal.
              </FeatureBody>
            </Step>
          </Steps>
        </Reveal>
      </Section>

      <Footer>
        <div>
          <Brand size={16} />
          {/* Static year keeps this page fully prerenderable (cacheComponents). */}
          <span>© 2026 Aegis. Vulnerability intelligence, verified.</span>
        </div>
      </Footer>
    </>
  );
}
