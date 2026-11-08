import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, CreditCard, Lock } from 'lucide-react';
import { styled } from '@yak/react';

import { PageEnter } from '@/components/motion/page-enter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { SubmitButton } from '@/components/ui/submit-button';
import { startCheckout } from '@/lib/billing/actions';
import { isSandbox, shurjopayConfigured } from '@/lib/billing/shurjopay';
import { requireAdmin } from '@/lib/auth/session';
import { formatDate, formatDateTime } from '@/lib/format';
import { activePlan, CARD_PLANS, formatBdt, PLANS, type PlanId } from '@/lib/plans';
import { createAuthClient } from '@/lib/supabase/server';
import { radiusLg, textSm } from '@/styles/tokens';

export const metadata: Metadata = { title: 'Billing' };

const Plans = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px;
`;

const Features = styled.ul`
  display: grid;
  gap: 8px;
  font-size: ${textSm};

  & li {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  & svg {
    flex: none;
    margin-top: 2px;
    color: var(--aq-success);
  }
`;

const Notice = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  padding: 14px 18px;
  border: 1px solid var(--aq-border-strong);
  border-radius: ${radiusLg};
  font-size: ${textSm};

  &[data-tone='success'] {
    border-color: var(--aq-success);
  }

  &[data-tone='error'] {
    border-color: var(--aq-sev-critical);
  }
`;

const History = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${textSm};

  & th,
  & td {
    text-align: left;
    padding: 10px 8px;
    border-bottom: 1px solid var(--aq-border);
    white-space: nowrap;
  }

  & th {
    color: var(--aq-muted-fg);
    font-weight: 600;
  }
`;

const MESSAGES: Record<string, { tone: 'success' | 'error'; text: string }> = {
  success: { tone: 'success', text: 'Payment received. Your plan is active.' },
  cancelled: { tone: 'error', text: 'The payment was cancelled. You have not been charged.' },
  failed: { tone: 'error', text: 'The payment did not go through. You have not been charged.' },
  pending: { tone: 'error', text: 'We could not confirm the payment yet. Refresh this page in a minute.' },
  unknown: { tone: 'error', text: 'That payment was not found.' },
  phone: { tone: 'error', text: 'Enter an 11-digit Bangladeshi mobile number, e.g. 01712345678.' },
  plan: { tone: 'error', text: 'Pick a plan to pay for.' },
  error: { tone: 'error', text: 'The payment page could not be opened. Please try again.' },
  unavailable: { tone: 'error', text: 'Card payments are not switched on yet.' },
};

type PaymentRow = {
  id: string;
  plan: PlanId;
  amount_bdt: number;
  status: string;
  method: string | null;
  created_at: string;
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; plan?: string }>;
}) {
  const [session, query] = await Promise.all([requireAdmin(), searchParams]);
  const org = session.organization;
  const current = activePlan(org);
  const enabled = shurjopayConfigured();
  const message = query.payment ? MESSAGES[query.payment] : undefined;

  const supabase = await createAuthClient();
  const { data: payments } = await supabase
    .from('payments')
    .select('id, plan, amount_bdt, status, method, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <PageEnter style={{ display: 'grid', gap: 18 }}>
      <PageHeader
        eyebrow="Administration"
        title="Billing"
        description="Pay for your plan by card. One payment covers 30 days."
      />

      {message ? (
        <Notice data-tone={message.tone} role="status">
          {message.text}
        </Notice>
      ) : null}

      <Card>
        <CardContent style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingTop: 20 }}>
          <span style={{ fontSize: textSm, color: 'var(--aq-muted-fg)' }}>Current plan</span>
          <Badge tone="primary">{current.name}</Badge>
          <span style={{ fontSize: textSm, color: 'var(--aq-muted-fg)' }}>
            {org?.plan_renews_at
              ? `Paid until ${formatDate(org.plan_renews_at)}`
              : current.id === 'trial'
                ? 'Free trial'
                : 'Set by Aegis — no renewal date'}
          </span>
        </CardContent>
      </Card>

      {!enabled ? (
        <Notice>
          <Lock size={14} /> Card payments are not switched on yet. Contact Aegis to upgrade.
        </Notice>
      ) : isSandbox() ? (
        <Notice data-tone="error">
          Test mode: payments go to the shurjoPay sandbox and no real money moves.
        </Notice>
      ) : null}

      <Plans>
        {CARD_PLANS.map((id) => {
          const plan = PLANS[id];
          return (
            <Card key={id}>
              <CardHeader>
                <CardTitle>
                  {plan.name} · {formatBdt(plan.priceBdt ?? 0)}
                  <span style={{ fontSize: textSm, fontWeight: 500, color: 'var(--aq-muted-fg)' }}>
                    {' '}/ 30 days
                  </span>
                </CardTitle>
                <CardDescription>{plan.blurb}</CardDescription>
              </CardHeader>
              <CardContent style={{ display: 'grid', gap: 16 }}>
                <Features>
                  {plan.features.slice(0, 5).map((feature) => (
                    <li key={feature}>
                      <Check size={14} /> {feature}
                    </li>
                  ))}
                </Features>
                {enabled ? (
                  <form action={startCheckout} style={{ display: 'grid', gap: 10 }}>
                    <input type="hidden" name="plan" value={id} />
                    <Input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="Mobile number for the receipt (01XXXXXXXXX)"
                      pattern="(\+?88)?01[3-9][0-9]{8}"
                      autoComplete="tel"
                      required
                    />
                    <SubmitButton
                      variant={plan.highlight ? 'primary' : 'outline'}
                      pendingLabel="Opening secure payment…"
                    >
                      <CreditCard size={15} /> Pay {formatBdt(plan.priceBdt ?? 0)} by card
                    </SubmitButton>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </Plans>

      <p style={{ fontSize: textSm, color: 'var(--aq-muted-fg)' }}>
        Card details are entered on shurjoPay&apos;s secure page and never reach Aegis. Need
        Enterprise or an invoice? See <Link href="/pricing" style={{ color: 'var(--aq-primary)' }}>pricing</Link>.
      </p>

      {payments && payments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
          </CardHeader>
          <CardContent style={{ overflowX: 'auto' }}>
            <History>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(payments as PaymentRow[]).map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDateTime(payment.created_at)}</td>
                    <td>{PLANS[payment.plan]?.name ?? payment.plan}</td>
                    <td>{formatBdt(Number(payment.amount_bdt))}</td>
                    <td>{payment.method ?? '—'}</td>
                    <td>
                      <Badge
                        tone={
                          payment.status === 'paid'
                            ? 'success'
                            : payment.status === 'initiated'
                              ? 'neutral'
                              : 'destructive'
                        }
                      >
                        {payment.status === 'initiated' ? 'Not completed' : payment.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </History>
          </CardContent>
        </Card>
      ) : null}
    </PageEnter>
  );
}
