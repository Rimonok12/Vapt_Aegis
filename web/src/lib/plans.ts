/**
 * Plan catalogue — the single source of truth for prices, limits and features.
 * Edit prices here; the pricing page, quota checks and feature gates all read
 * from this file. Amounts are Bangladeshi taka per month.
 */

import type { PlanId } from '@/lib/database.types';

export type { PlanId };

export type Plan = {
  id: PlanId;
  name: string;
  /** Monthly price in BDT; null = custom quote. */
  priceBdt: number | null;
  /** Shown before the price for custom plans, e.g. "from". */
  pricePrefix?: string;
  /** Reports an organisation may create: per month, or in total for the trial. */
  reportLimit: number | null;
  reportLimitPeriod: 'month' | 'total';
  members: number | null;
  perAssetView: boolean;
  itAudits: boolean;
  blurb: string;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  trial: {
    id: 'trial',
    name: 'Free trial',
    priceBdt: 0,
    reportLimit: 1,
    reportLimitPeriod: 'total',
    members: 2,
    perAssetView: true,
    itAudits: true,
    blurb: 'See a full report on your own scan before you buy.',
    features: [
      '1 scan report',
      'Every feature unlocked',
      'NID-verified access',
      'PDF export',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceBdt: 70_000,
    reportLimit: 5,
    reportLimitPeriod: 'month',
    members: 3,
    perAssetView: false,
    itAudits: false,
    blurb: 'For small teams running a few scans a month.',
    features: [
      '5 scan reports / month',
      'Up to 3 team members',
      'Executive summary + remediation plan',
      'Risk trend dashboard',
      'PDF export',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    priceBdt: 150_000,
    reportLimit: null,
    reportLimitPeriod: 'month',
    members: 10,
    perAssetView: true,
    itAudits: true,
    highlight: true,
    blurb: 'For security teams reporting to management every month.',
    features: [
      'Unlimited scan reports',
      'Up to 10 team members',
      'Per-asset view (which host to fix)',
      'IT audit checklists — ISO 27001 & Bangladesh Bank ICT',
      'Everything in Starter',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceBdt: 300_000,
    pricePrefix: 'from',
    reportLimit: null,
    reportLimitPeriod: 'month',
    members: null,
    perAssetView: true,
    itAudits: true,
    blurb: 'For banks, telcos and groups with many entities.',
    features: [
      'Unlimited reports and members',
      'Multiple organisations',
      'Priority support + onboarding',
      'Real Porichoy NID verification',
      'Everything in Business',
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ['trial', 'starter', 'business', 'enterprise'];

export function planOf(value: string | null | undefined): Plan {
  return PLANS[(value as PlanId) ?? 'trial'] ?? PLANS.trial;
}

/** ৳1,50,000 — Bangladeshi (lakh) digit grouping. */
export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

/**
 * Hosted card-payment link per plan (aamarPay / SSLCommerz / shurjoPay /
 * Payoneer payment links). Card details never touch this app. Unset → the
 * pricing page falls back to "Contact sales".
 */
export function paymentUrl(plan: PlanId): string | null {
  const urls: Partial<Record<PlanId, string | undefined>> = {
    starter: process.env.NEXT_PUBLIC_PAYMENT_URL_STARTER,
    business: process.env.NEXT_PUBLIC_PAYMENT_URL_BUSINESS,
    enterprise: process.env.NEXT_PUBLIC_PAYMENT_URL_ENTERPRISE,
  };
  const url = urls[plan]?.trim();
  return url && /^https:\/\//.test(url) ? url : null;
}

export const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL?.trim() || null;
