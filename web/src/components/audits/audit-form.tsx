'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { CheckCircle2, Link2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { styled } from '@yak/react';

import { ScoreRing } from '@/components/audits/score-ring';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveAudit } from '@/lib/audits/actions';
import {
  getFramework,
  scoreAudit,
  type AnswerValue,
  type Answers,
  type Control,
} from '@/lib/audits/frameworks';
import { radiusMd, textSm, textXs } from '@/styles/tokens';

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 14px;
  align-items: start;

  @media (max-width: 1080px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Side = styled.div`
  display: grid;
  gap: 14px;
  position: sticky;
  top: 78px;

  @media (max-width: 1080px) {
    position: static;
    order: -1;
  }
`;

const DomainTitle = styled.h3`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--aq-muted-fg);
  margin: 8px 0 2px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px 18px;
  align-items: start;
  padding: 14px 0;
  border-top: 1px solid var(--aq-border);

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Question = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;

  & strong {
    font-size: 0.88rem;
    font-weight: 600;
    display: flex;
    gap: 8px;
    align-items: baseline;
    flex-wrap: wrap;
  }

  & p {
    font-size: ${textSm};
    color: var(--aq-muted-fg);
    line-height: 1.5;
  }
`;

const Code = styled.code`
  font-family: var(--font-geist-mono), monospace;
  font-size: ${textXs};
  color: var(--aq-primary);
  background: var(--aq-primary-soft);
  padding: 1px 6px;
  border-radius: 5px;
`;

const Choices = styled.div`
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border-radius: ${radiusMd};
  border: 1px solid var(--aq-border);
  background: var(--aq-muted);
  height: fit-content;
`;

const Choice = styled.button`
  height: 30px;
  padding-inline: 11px;
  border-radius: calc(${radiusMd} - 3px);
  font-size: ${textXs};
  font-weight: 600;
  color: var(--aq-muted-fg);
  transition:
    background-color 140ms ease,
    color 140ms ease;

  &:hover:not(:disabled) {
    color: var(--aq-fg);
  }

  &:disabled {
    cursor: default;
  }

  &[data-active='true'] {
    color: var(--aq-fg);
    background: var(--aq-card);
    box-shadow: var(--aq-shadow-sm);
  }

  &[data-active='true'][data-value='yes'] {
    color: var(--aq-success);
  }

  &[data-active='true'][data-value='partial'] {
    color: color-mix(in oklab, var(--aq-sev-medium) 70%, var(--aq-fg));
  }

  &[data-active='true'][data-value='no'] {
    color: var(--aq-sev-critical);
  }
`;

const Note = styled.input`
  grid-column: 1 / -1;
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border-radius: ${radiusMd};
  border: 1px dashed var(--aq-border-strong);
  background: transparent;
  font-size: ${textXs};

  &:focus-visible {
    outline: none;
    border-style: solid;
    border-color: var(--aq-ring);
  }
`;

const Bar = styled.div`
  display: grid;
  gap: 5px;
  font-size: ${textXs};

  & > div:first-child {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  & > div:first-child span {
    color: var(--aq-muted-fg);
  }
`;

const Track = styled.div`
  height: 6px;
  border-radius: 999px;
  background: var(--aq-muted);
  overflow: hidden;

  & > div {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--aq-primary), #00b2c4);
    transition: width 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const CHOICES: { value: AnswerValue; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'partial', label: 'Partly' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'N/A' },
];

export function AuditForm({
  auditId,
  frameworkId,
  initialAnswers,
  readOnly,
  completed,
  latestRiskScore,
}: {
  auditId: string;
  frameworkId: string;
  initialAnswers: Answers;
  readOnly: boolean;
  completed: boolean;
  latestRiskScore: number | null;
}) {
  const framework = getFramework(frameworkId);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [saving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = readOnly || completed;

  const result = useMemo(
    () => (framework ? scoreAudit(framework, answers) : null),
    [framework, answers]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Control[]>();
    for (const control of framework?.controls ?? []) {
      map.set(control.domain, [...(map.get(control.domain) ?? []), control]);
    }
    return [...map.entries()];
  }, [framework]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (!framework || !result) return <p>Unknown checklist.</p>;

  function persist(next: Answers, complete = false) {
    startSaving(async () => {
      const response = await saveAudit({ auditId, answers: next, complete });
      if (!response.ok) {
        toast.error(response.message ?? 'Could not save the audit.');
        return;
      }
      setSavedAt(new Date());
      if (complete) toast.success('Audit completed.');
    });
  }

  function update(controlId: string, patch: Partial<{ value: AnswerValue; note: string }>) {
    if (locked) return;
    setAnswers((current) => {
      const previous = current[controlId];
      const value = patch.value ?? previous?.value;
      if (!value) return current;
      const next = { ...current, [controlId]: { ...previous, ...patch, value } };
      if (timer.current) clearTimeout(timer.current);
      // Debounced autosave so typing a note doesn't fire a request per key.
      timer.current = setTimeout(() => persist(next), patch.note !== undefined ? 900 : 250);
      return next;
    });
  }

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>{framework.name}</CardTitle>
          <CardDescription>
            {framework.description} Questions are Aegis&apos;s own wording; this is a readiness
            self-assessment, not a certification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {grouped.map(([domain, controls]) => (
            <section key={domain}>
              <DomainTitle>{domain}</DomainTitle>
              {controls.map((control) => {
                const answer = answers[control.id];
                return (
                  <Row key={control.id}>
                    <Question>
                      <strong>
                        <Code>{control.id}</Code>
                        {control.title}
                        {control.weight === 3 ? <Badge tone="critical">Critical</Badge> : null}
                      </strong>
                      <p>{control.question}</p>
                      {control.linkedToScans ? (
                        <p style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Link2 size={13} />
                          {latestRiskScore === null
                            ? 'No completed scan yet — upload one to evidence this control.'
                            : `Evidence: latest scan risk score ${latestRiskScore}/100.`}
                        </p>
                      ) : null}
                    </Question>
                    <Choices role="radiogroup" aria-label={`${control.id} answer`}>
                      {CHOICES.map((choice) => (
                        <Choice
                          key={choice.value}
                          type="button"
                          role="radio"
                          aria-checked={answer?.value === choice.value}
                          data-active={answer?.value === choice.value}
                          data-value={choice.value}
                          disabled={locked}
                          onClick={() => update(control.id, { value: choice.value })}
                        >
                          {choice.label}
                        </Choice>
                      ))}
                    </Choices>
                    {(answer && !locked) || answer?.note ? (
                      <Note
                        placeholder="Evidence or note (optional)"
                        defaultValue={answer?.note ?? ''}
                        readOnly={locked}
                        maxLength={600}
                        onChange={(event) => update(control.id, { note: event.target.value })}
                      />
                    ) : null}
                  </Row>
                );
              })}
            </section>
          ))}
        </CardContent>
      </Card>

      <Side>
        <Card>
          <CardContent style={{ display: 'grid', gap: 16, justifyItems: 'center', paddingTop: 22 }}>
            <ScoreRing score={result.score} />
            <div style={{ fontSize: textSm, color: 'var(--aq-muted-fg)', textAlign: 'center' }}>
              {result.answered} of {result.total} controls answered
            </div>
            <div style={{ display: 'grid', gap: 12, width: '100%' }}>
              {result.byDomain.map((domain) => (
                <Bar key={domain.domain}>
                  <div>
                    <strong style={{ fontWeight: 600 }}>{domain.domain}</strong>
                    <span>{domain.score === null ? '—' : `${domain.score}%`}</span>
                  </div>
                  <Track>
                    <div style={{ width: `${domain.score ?? 0}%` }} />
                  </Track>
                </Bar>
              ))}
            </div>
            {!locked ? (
              <div style={{ display: 'grid', gap: 8, width: '100%' }}>
                <Button
                  type="button"
                  disabled={saving || result.answered < result.total}
                  onClick={() => persist(answers, true)}
                  style={{ width: '100%' }}
                >
                  <CheckCircle2 size={15} /> Mark audit complete
                </Button>
                <span
                  style={{
                    fontSize: textXs,
                    color: 'var(--aq-muted-fg)',
                    display: 'inline-flex',
                    gap: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={12} className="aq-spin" /> Saving…
                    </>
                  ) : savedAt ? (
                    `Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  ) : (
                    'Changes save automatically'
                  )}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {result.gaps.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Top gaps</CardTitle>
              <CardDescription>Fix these first — highest weight on top.</CardDescription>
            </CardHeader>
            <CardContent style={{ display: 'grid', gap: 10 }}>
              {result.gaps.slice(0, 6).map((gap) => (
                <div key={gap.id} style={{ display: 'flex', gap: 8, fontSize: textSm }}>
                  <Code>{gap.id}</Code>
                  <span>{gap.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </Side>
    </Layout>
  );
}
