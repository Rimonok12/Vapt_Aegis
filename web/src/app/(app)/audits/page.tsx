import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardCheck, Lock } from 'lucide-react';
import { styled } from '@yak/react';

import { ScoreRing } from '@/components/audits/score-ring';
import { PageEnter } from '@/components/motion/page-enter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { createAudit } from '@/lib/audits/actions';
import { FRAMEWORKS, getFramework } from '@/lib/audits/frameworks';
import { requireVerifiedUser } from '@/lib/auth/session';
import { listAudits } from '@/lib/data/audits';
import { relativeTime } from '@/lib/format';
import { planOf } from '@/lib/plans';
import { radiusLg, radiusMd, textSm } from '@/styles/tokens';

export const metadata: Metadata = { title: 'IT audits' };

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 14px;
`;

const Tile = styled(Link)`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
  border: 1px solid var(--aq-border);
  border-radius: ${radiusLg};
  background: var(--aq-card);
  box-shadow:
    var(--aq-shadow-sm),
    inset 0 1px 0 var(--aq-highlight);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;

  &:hover {
    border-color: color-mix(in oklab, var(--aq-primary) 35%, var(--aq-border-strong));
    box-shadow: var(--aq-shadow-lg);
    transform: translateY(-2px);
  }

  & h3 {
    font-size: 0.95rem;
    font-weight: 620;
    letter-spacing: -0.02em;
    overflow-wrap: anywhere;
  }

  & p {
    font-size: ${textSm};
    color: var(--aq-muted-fg);
    margin-top: 3px;
  }
`;

const NewForm = styled.form`
  display: grid;
  gap: 12px;
`;

const Frameworks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 10px;
`;

const FrameworkOption = styled.label`
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--aq-border);
  border-radius: ${radiusMd};
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease;

  &:has(input:checked) {
    border-color: var(--aq-primary);
    background: var(--aq-primary-soft);
  }

  & input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  & strong {
    font-size: 0.88rem;
    font-weight: 620;
  }

  & span {
    font-size: ${textSm};
    color: var(--aq-muted-fg);
    line-height: 1.45;
  }
`;

const Notice = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 16px 18px;
  border: 1px dashed var(--aq-border-strong);
  border-radius: ${radiusLg};
  font-size: ${textSm};
  color: var(--aq-muted-fg);

  & a {
    color: var(--aq-primary);
    font-weight: 600;
  }
`;

export default async function AuditsPage() {
  const session = await requireVerifiedUser();
  const plan = planOf(session.organization?.plan);
  const isAdmin = session.profile.role === 'admin';
  const { audits, missing } = await listAudits();

  return (
    <PageEnter style={{ display: 'grid', gap: 18 }}>
      <PageHeader
        eyebrow="Compliance"
        title="IT audits"
        description="Score your controls against ISO 27001 and the Bangladesh Bank ICT Security Guideline, next to your scan results."
      />

      {missing ? (
        <Notice>
          <span>
            IT audits need a one-time database update. An administrator must run{' '}
            <code>supabase/migrations/002_plans_assets_audits.sql</code> in the Supabase SQL
            editor.
          </span>
        </Notice>
      ) : !plan.itAudits ? (
        <Notice>
          <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <Lock size={14} /> IT audit checklists are included in the Business and Enterprise
            plans.
          </span>
          <Link href="/pricing">See plans →</Link>
        </Notice>
      ) : isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Start an audit</CardTitle>
            <CardDescription>
              Pick a checklist. Answers save as you go and the score updates live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewForm action={createAudit}>
              <Frameworks>
                {FRAMEWORKS.map((framework, index) => (
                  <FrameworkOption key={framework.id}>
                    <input
                      type="radio"
                      name="framework"
                      value={framework.id}
                      defaultChecked={index === 0}
                    />
                    <strong>{framework.name}</strong>
                    <span>
                      {framework.controls.length} controls · {framework.description}
                    </span>
                  </FrameworkOption>
                ))}
              </Frameworks>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Input
                  name="title"
                  placeholder="Audit title (optional)"
                  maxLength={120}
                  style={{ flex: '1 1 240px' }}
                />
                <Button type="submit">
                  <ClipboardCheck size={15} /> Start audit
                </Button>
              </div>
            </NewForm>
          </CardContent>
        </Card>
      ) : null}

      {!missing && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 650, margin: '8px 0 14px' }}>
            {audits.length > 0 ? 'Audits' : 'No audits yet'}
          </h2>
          {audits.length === 0 ? (
            <p style={{ fontSize: textSm, color: 'var(--aq-muted-fg)' }}>
              {isAdmin
                ? 'Start your first audit above.'
                : 'Your administrator has not run an audit yet.'}
            </p>
          ) : (
            <Grid>
              {audits.map((audit) => {
                const framework = getFramework(audit.framework);
                return (
                  <Tile key={audit.id} href={`/audits/${audit.id}`}>
                    <ScoreRing score={audit.score} size={64} />
                    <div style={{ minWidth: 0, display: 'grid', gap: 6 }}>
                      <h3>{audit.title}</h3>
                      <p>
                        {framework?.short ?? audit.framework} · updated{' '}
                        {relativeTime(audit.updated_at)}
                      </p>
                      <Badge tone={audit.status === 'completed' ? 'success' : 'info'}>
                        {audit.status === 'completed' ? 'Completed' : 'In progress'}
                      </Badge>
                    </div>
                  </Tile>
                );
              })}
            </Grid>
          )}
        </div>
      )}
    </PageEnter>
  );
}
