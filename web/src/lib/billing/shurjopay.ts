import 'server-only';

import { env } from '@/lib/env';

/**
 * shurjoPay REST API (v2): get_token → secret-pay → hosted checkout →
 * verification. Card details are entered on shurjoPay's page only. A payment
 * counts as paid solely when the server-to-server verification call returns
 * sp_code 1000 — the browser's return URL is never trusted on its own.
 */

export function shurjopayConfigured(): boolean {
  const { shurjopayUsername, shurjopayPassword, shurjopayPrefix } = env();
  return Boolean(shurjopayUsername && shurjopayPassword && shurjopayPrefix);
}

export const isSandbox = () => env().shurjopayUrl.includes('sandbox');

type Token = { token: string; storeId: number };

async function post<T>(path: string, body: unknown, token?: string): Promise<T | null> {
  try {
    const response = await fetch(`${env().shurjopayUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getToken(): Promise<Token | null> {
  const { shurjopayUsername, shurjopayPassword } = env();
  const data = await post<{ token?: string; store_id?: number }>('/api/get_token', {
    username: shurjopayUsername,
    password: shurjopayPassword,
  });
  return data?.token && data.store_id !== undefined
    ? { token: data.token, storeId: data.store_id }
    : null;
}

export async function createCheckout(input: {
  orderId: string;
  amount: number;
  returnUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  clientIp: string;
  reference: string;
}): Promise<{ ok: true; checkoutUrl: string; providerOrderId: string } | { ok: false }> {
  const auth = await getToken();
  if (!auth) return { ok: false };
  const data = await post<{ checkout_url?: string; sp_order_id?: string }>(
    '/api/secret-pay',
    {
      prefix: env().shurjopayPrefix,
      token: auth.token,
      store_id: auth.storeId,
      return_url: input.returnUrl,
      cancel_url: input.returnUrl,
      amount: input.amount,
      order_id: input.orderId,
      currency: 'BDT',
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      customer_address: 'Bangladesh',
      customer_city: 'Dhaka',
      customer_post_code: '1000',
      client_ip: input.clientIp,
      value1: input.reference,
    },
    auth.token
  );
  return data?.checkout_url && data.sp_order_id
    ? { ok: true, checkoutUrl: data.checkout_url, providerOrderId: data.sp_order_id }
    : { ok: false };
}

export type Verification = {
  paid: boolean;
  amount: number;
  currency: string;
  customerOrderId: string;
  method: string | null;
  bankTrxId: string | null;
  cancelled: boolean;
};

export async function verifyPayment(providerOrderId: string): Promise<Verification | null> {
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(providerOrderId)) return null;
  const auth = await getToken();
  if (!auth) return null;
  const data = await post<Array<Record<string, unknown>>>(
    '/api/verification',
    { order_id: providerOrderId },
    auth.token
  );
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;
  const code = String(row.sp_code ?? '');
  return {
    paid: code === '1000',
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? ''),
    customerOrderId: String(row.customer_order_id ?? ''),
    method: typeof row.method === 'string' ? row.method : null,
    bankTrxId: typeof row.bank_trx_id === 'string' ? row.bank_trx_id : null,
    cancelled: code === '1002' || /cancel/i.test(String(row.sp_message ?? '')),
  };
}
