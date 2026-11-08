'use server';

import { randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth/session';
import { createCheckout, shurjopayConfigured } from '@/lib/billing/shurjopay';
import { env } from '@/lib/env';
import { CARD_PLANS, PLANS, type PlanId } from '@/lib/plans';
import { createAdminClient } from '@/lib/supabase/admin';

/** Start a shurjoPay card checkout for one month of a plan. Admins only. */
export async function startCheckout(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const organizationId = session.profile.organization_id;
  if (!organizationId) redirect('/billing?payment=no-org');
  if (!shurjopayConfigured()) redirect('/billing?payment=unavailable');

  const planId = String(formData.get('plan') ?? '') as PlanId;
  const plan = CARD_PLANS.includes(planId) ? PLANS[planId] : null;
  if (!plan?.priceBdt) redirect('/billing?payment=plan');

  const phone = String(formData.get('phone') ?? '').replace(/[\s-]/g, '').replace(/^\+?88/, '');
  if (!/^01[3-9]\d{8}$/.test(phone)) redirect(`/billing?payment=phone&plan=${planId}`);

  const orderId = `${env().shurjopayPrefix}${randomBytes(6).toString('hex')}`;
  const admin = createAdminClient();
  const { data: payment, error } = await admin
    .from('payments')
    .insert({
      organization_id: organizationId,
      plan: plan.id,
      amount_bdt: plan.priceBdt,
      customer_order_id: orderId,
      created_by: session.userId,
    })
    .select('id')
    .single();
  if (error || !payment) redirect('/billing?payment=error');

  const forwarded = (await headers()).get('x-forwarded-for') ?? '';
  const checkout = await createCheckout({
    orderId,
    amount: plan.priceBdt,
    returnUrl: `${env().appUrl}/api/billing/shurjopay/return`,
    customerName: session.organization?.name ?? 'Aegis customer',
    customerEmail: session.email ?? 'billing@aegis-vapt.site',
    customerPhone: phone,
    clientIp: forwarded.split(',')[0]?.trim() || '127.0.0.1',
    reference: payment.id,
  });
  if (!checkout.ok) {
    await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id);
    redirect('/billing?payment=error');
  }

  await admin
    .from('payments')
    .update({ provider_order_id: checkout.providerOrderId })
    .eq('id', payment.id);
  redirect(checkout.checkoutUrl);
}
