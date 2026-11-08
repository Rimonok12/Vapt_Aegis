import { NextResponse, type NextRequest } from 'next/server';

import { verifyPayment } from '@/lib/billing/shurjopay';
import { createAdminClient } from '@/lib/supabase/admin';

const PERIOD_DAYS = 30;

/**
 * shurjoPay sends the browser here (?order_id=<sp_order_id>) after checkout,
 * paid or not. Nothing in the URL is trusted: the payment is verified with
 * shurjoPay server-to-server and must match the amount we asked for. Safe to
 * hit repeatedly — a payment activates the plan only once.
 */
export async function GET(request: NextRequest) {
  const back = (state: string) =>
    NextResponse.redirect(new URL(`/billing?payment=${state}`, request.nextUrl));

  const providerOrderId = request.nextUrl.searchParams.get('order_id') ?? '';
  const admin = createAdminClient();
  const { data: payment } = await admin
    .from('payments')
    .select('*')
    .eq('provider_order_id', providerOrderId)
    .maybeSingle();
  if (!payment) return back('unknown');
  if (payment.status === 'paid') return back('success');

  const result = await verifyPayment(providerOrderId);
  if (!result) return back('pending');

  const matches =
    result.paid &&
    result.currency.toUpperCase() === 'BDT' &&
    result.amount >= Number(payment.amount_bdt) &&
    result.customerOrderId === payment.customer_order_id;

  if (!matches) {
    if (payment.status === 'initiated') {
      await admin
        .from('payments')
        .update({ status: result.cancelled ? 'cancelled' : 'failed' })
        .eq('id', payment.id)
        .eq('status', 'initiated');
    }
    return back(result.cancelled ? 'cancelled' : 'failed');
  }

  // Claim the payment atomically so a double return can't extend twice.
  const now = new Date();
  const { data: claimed } = await admin
    .from('payments')
    .update({
      status: 'paid',
      paid_at: now.toISOString(),
      method: result.method,
      bank_trx_id: result.bankTrxId,
    })
    .eq('id', payment.id)
    .neq('status', 'paid')
    .select('id');
  if (!claimed?.length) return back('success');

  const { data: org } = await admin
    .from('organizations')
    .select('plan, plan_renews_at')
    .eq('id', payment.organization_id)
    .maybeSingle();
  // Renewing the same plan early stacks onto the remaining time.
  const current = org?.plan_renews_at ? new Date(org.plan_renews_at) : null;
  const start = org?.plan === payment.plan && current && current > now ? current : now;
  const renewsAt = new Date(start.getTime() + PERIOD_DAYS * 86_400_000);

  await admin
    .from('organizations')
    .update({ plan: payment.plan, plan_renews_at: renewsAt.toISOString() })
    .eq('id', payment.organization_id);

  return back('success');
}
