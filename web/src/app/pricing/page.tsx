import type { Metadata } from 'next';
import { Check, CreditCard, Fingerprint, ShieldCheck, Sparkles } from 'lucide-react';
import { styled } from '@yak/react';

import { Brand } from '@/components/brand';
import { SiteNav } from '@/components/landing/site-nav';
import { Reveal } from '@/components/motion/reveal';
import { AnchorButton } from '@/components/ui/button';
import {
  formatBdt,
  paymentUrl,
  PLAN_ORDER,
  PLANS,
  SALES_EMAIL,
  type Plan,
} from '@/lib/plans';
import { radiusLg, radiusMd, shellMax, textSm } from '@/styles/tokens';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Aegis plans and professional security services, priced in Bangladeshi taka.',
};

const Page = styled.main`
  max-width: ${shellMax};
  margin-inline: auto;
  padding: 64px 20px 96px;
  display: grid;
  gap: 72px;

  @media (max-width: 560px) {
    padding: 40px 16px 72px;
    gap: 56px;
  }
`;

const Head = styled.div`
  display: grid;
  gap: 14px;
  justify-items: center;
  text-align: center;

  & h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 720;
    letter-spacing: -0.045em;
    line-height: 1.05;
    max-width: 20ch;
  }

  & p {
    color: var(--aq-muted-fg);
    font-size: 1rem;
    max-width: 60ch;
  }
`;

const Kicker = styled.p`
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--aq-primary) !important;
`;

const Plans = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const PlanCard = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 26px 24px;
  border: 1px solid var(--aq-border);
  border-radius: ${radiusLg};
  background: var(--aq-card);
  box-shadow:
    var(--aq-shadow-sm),
    inset 0 1px 0 var(--aq-highlight);

  &[data-highlight='true'] {
    border-color: color-mix(in oklab, var(--aq-primary) 55%, transparent);
    background:
      radial-gradient(120% 70% at 50% 0%, var(--aq-glow), transparent 70%),
      var(--aq-card);
    box-shadow:
      var(--aq-shadow-xl),
      0 0 0 1px color-mix(in oklab, var(--aq-primary) 30%, transparent),
      inset 0 1px 0 var(--aq-highlight);
  }
`;

const Popular = styled.span`
  position: absolute;
  top: -11px;
  left: 24px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--aq-primary-fg);
  background: linear-gradient(120deg, var(--aq-primary), #00b2c4);
  box-shadow: var(--aq-shadow-md);
`;

const PlanName = styled.h2`
  font-size: 1.05rem;
  font-weight: 650;
  letter-spacing: -0.02em;
`;

const Price = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;

  & strong {
    font-size: 2.1rem;
    font-weight: 740;
    letter-spacing: -0.045em;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  & span {
    font-size: ${textSm};
    color: var(--aq-muted-fg);
  }
`;

const Blurb = styled.p`
  font-size: ${textSm};
  color: var(--aq-muted-fg);
  line-height: 1.55;
  min-height: 2.6em;
`;

const Features = styled.ul`
  display: grid;
  gap: 10px;
  flex: 1;

  & li {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    font-size: ${textSm};
    line-height: 1.45;
  }

  & svg {
    flex: none;
    margin-top: 2px;
    color: var(--aq-success);
  }
`;

const Ctas = styled.div`
  display: grid;
  gap: 8px;

  & > * {
    width: 100%;
  }
`;

const SectionHead = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 22px;

  & h2 {
    font-size: clamp(1.5rem, 3.2vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.035em;
  }

  & p {
    color: var(--aq-muted-fg);
    max-width: 62ch;
  }
`;

const Services = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 16px;
`;

const Service = styled.div`
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 22px;
  border: 1px solid var(--aq-border);
  border-radius: ${radiusLg};
  background: var(--aq-card);
  box-shadow:
    var(--aq-shadow-sm),
    inset 0 1px 0 var(--aq-highlight);

  & h3 {
    font-size: 1rem;
    font-weight: 640;
    letter-spacing: -0.02em;
  }

  & p {
    font-size: ${textSm};
    color: var(--aq-muted-fg);
    line-height: 1.55;
  }

  & em {
    font-style: normal;
    font-size: 0.78rem;
    font-weight: 650;
    color: var(--aq-primary);
  }
`;

const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 14px;
`;

const Step = styled.li`
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px dashed var(--aq-border-strong);
  border-radius: ${radiusMd};

  & svg {
    color: var(--aq-primary);
  }

  & strong {
    font-size: 0.92rem;
    font-weight: 620;
  }

  & span {
    font-size: ${textSm};
    color: var(--aq-muted-fg);
    line-height: 1.5;
  }
`;

const Fine = styled.p`
  text-align: center;
  font-size: 0.78rem;
  color: var(--aq-muted-fg);
`;

const SERVICES = [
  {
    title: 'Manual penetration test (VAPT)',
    body: 'A tester attacks your web apps, APIs and network the way a real attacker would, then the findings land in your Aegis workspace with a remediation plan.',
  },
  {
    title: 'IT audit & Bangladesh Bank ICT readiness',
    body: 'A guided review of your controls against ISO 27001 and the Bangladesh Bank ICT Security Guideline, with an evidence pack your auditors can use.',
  },
  {
    title: 'Managed monthly scanning',
    body: 'We run and review your scans every month, track fixes over time and brief your management on the risk trend.',
  },
];

function salesHref(subject: string): string {
  return SALES_EMAIL
    ? `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}`
    : '/signup';
}

function PlanCta({ plan }: { plan: Plan }) {
  if (plan.id === 'trial') {
    return (
      <AnchorButton href="/signup" variant="outline" size="lg">
        Start free trial
      </AnchorButton>
    );
  }
  const pay = paymentUrl(plan.id);
  return (
    <>
      {pay ? (
        <AnchorButton
          href={pay}
          target="_blank"
          rel="noopener noreferrer"
          variant={plan.highlight ? 'primary' : 'outline'}
          size="lg"
        >
          <CreditCard size={16} /> Pay by card
        </AnchorButton>
      ) : null}
      <AnchorButton
        href={salesHref(`Aegis ${plan.name} plan`)}
        variant={pay ? 'ghost' : plan.highlight ? 'primary' : 'outline'}
        size={pay ? 'md' : 'lg'}
      >
        {plan.id === 'enterprise' ? 'Talk to sales' : pay ? 'Questions? Contact us' : 'Get this plan'}
      </AnchorButton>
    </>
  );
}

export default function PricingPage() {
  return (
    <>
      <SiteNav current="pricing" />
      <Page>
        <Head>
          <Kicker>Pricing</Kicker>
          <h1>Board-ready security reporting, priced in taka.</h1>
          <p>
            One workspace per organisation. Every member signs in with a verified Bangladesh
            National ID, and your scan data is sanitised before it is stored.
          </p>
        </Head>

        <Plans>
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            return (
              <PlanCard key={id} data-highlight={plan.highlight ? 'true' : 'false'}>
                {plan.highlight ? (
                  <Popular>
                    <Sparkles size={12} /> Most popular
                  </Popular>
                ) : null}
                <div style={{ display: 'grid', gap: 10 }}>
                  <PlanName>{plan.name}</PlanName>
                  <Price>
                    {plan.pricePrefix ? <span>{plan.pricePrefix}</span> : null}
                    <strong>
                      {plan.priceBdt === 0 ? 'Free' : formatBdt(plan.priceBdt ?? 0)}
                    </strong>
                    {plan.priceBdt ? <span>/ month</span> : null}
                  </Price>
                  <Blurb>{plan.blurb}</Blurb>
                </div>
                <Features>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={15} /> {feature}
                    </li>
                  ))}
                </Features>
                <Ctas>
                  <PlanCta plan={plan} />
                </Ctas>
              </PlanCard>
            );
          })}
        </Plans>

        <Reveal>
          <SectionHead>
            <Kicker>Professional services</Kicker>
            <h2>Need people, not just a portal?</h2>
            <p>
              Hands-on engagements, quoted per scope. Results are delivered inside your Aegis
              workspace so your team can track every fix.
            </p>
          </SectionHead>
          <Services>
            {SERVICES.map((service) => (
              <Service key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <em>Quoted per scope</em>
                <div>
                  <AnchorButton href={salesHref(service.title)} variant="outline" size="sm">
                    Request a quote
                  </AnchorButton>
                </div>
              </Service>
            ))}
          </Services>
        </Reveal>

        <Reveal>
          <SectionHead>
            <Kicker>How it works</Kicker>
            <h2>From sign-up to your first report.</h2>
          </SectionHead>
          <Steps>
            <Step>
              <Fingerprint size={18} />
              <strong>Sign up & verify</strong>
              <span>Create your workspace and pass the one-time National ID check.</span>
            </Step>
            <Step>
              <ShieldCheck size={18} />
              <strong>Try it free</strong>
              <span>Upload one scan on the free trial and review the full report.</span>
            </Step>
            <Step>
              <CreditCard size={18} />
              <strong>Pay by card</strong>
              <span>
                Pay on a secure hosted payment page. Card details never touch Aegis.
              </span>
            </Step>
            <Step>
              <Sparkles size={18} />
              <strong>Plan activated</strong>
              <span>Your plan is switched on once the payment is confirmed.</span>
            </Step>
          </Steps>
        </Reveal>

        <Fine>
          Prices in Bangladeshi taka (BDT) per organisation per month. Plans can change at any
          time; unused reports do not roll over.
        </Fine>
      </Page>
      <footer
        style={{
          borderTop: '1px solid var(--aq-border)',
          padding: '26px 20px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Brand size={16} />
      </footer>
    </>
  );
}
