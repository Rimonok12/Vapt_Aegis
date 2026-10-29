import { NextResponse, type NextRequest } from 'next/server';

import { getSession } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ScanSource } from '@/lib/types';

const MAX_BYTES = 25 * 1024 * 1024;

function detectSource(filename: string): ScanSource | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.nessus')) return 'nessus';
  if (lower.endsWith('.nmap') || (lower.endsWith('.xml') && !lower.endsWith('.nessus')))
    return 'nmap';
  if (lower.endsWith('.json')) return 'json';
  return null;
}

/**
 * Admin-only ingest proxy.
 *
 * 1. Creates a `processing` row with the service client (RLS would block the
 *    browser, and we never trust a client-supplied organisation id).
 * 2. Streams the raw file to the FastAPI parser, which sanitises findings,
 *    drafts the AI report and updates the same row in place.
 *
 * The raw scan file is never stored anywhere in Supabase.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.profile.nid_verified || session.profile.role !== 'admin') {
    return NextResponse.json({ message: 'Administrator access required.' }, { status: 403 });
  }

  const organizationId = session.profile.organization_id;
  if (!organizationId) {
    return NextResponse.json(
      { message: 'Your account is not attached to an organisation yet.' },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: 'Malformed upload.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: 'No scan file provided.' }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: 'File exceeds the 25 MB limit.' }, { status: 413 });
  }

  const source = detectSource(file.name);
  if (!source) {
    return NextResponse.json(
      { message: 'Unsupported file type. Upload a .nessus, .nmap/.xml or .json export.' },
      { status: 422 }
    );
  }

  const rawTitle = String(formData.get('title') ?? '').trim();
  const title =
    rawTitle ||
    `${file.name.replace(/\.[a-z]+$/i, '')} · ${new Date().toLocaleDateString('en-GB')}`;

  const admin = createAdminClient();
  const { data: row, error: insertError } = await admin
    .from('reports')
    .insert({
      organization_id: organizationId,
      title,
      source,
      original_filename: file.name,
      status: 'processing',
      created_by: session.userId,
    })
    .select('id')
    .single();

  if (insertError || !row) {
    return NextResponse.json(
      { message: `Could not create the report record: ${insertError?.message ?? 'unknown'}` },
      { status: 500 }
    );
  }

  // Hand off to the parser service.
  const { backendUrl, backendToken } = env();
  const payload = new FormData();
  payload.append('file', file);
  payload.append('report_id', row.id);

  try {
    const response = await fetch(`${backendUrl}/api/v1/ingest`, {
      method: 'POST',
      headers: backendToken ? { Authorization: `Bearer ${backendToken}` } : undefined,
      body: payload,
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      await admin
        .from('reports')
        .update({ status: 'failed', error: `Parser rejected the file (HTTP ${response.status}).` })
        .eq('id', row.id);
      return NextResponse.json(
        {
          message: `The parser service rejected the file (HTTP ${response.status}).`,
          reportId: row.id,
        },
        { status: 502 }
      );
    }
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'TimeoutError'
        ? 'The parser service is busy. Processing continues in the background.'
        : 'The parser service is unreachable. Start the backend and re-upload.';
    if (error instanceof Error && error.name !== 'TimeoutError') {
      await admin.from('reports').update({ status: 'failed', error: message }).eq('id', row.id);
      return NextResponse.json({ message, reportId: row.id }, { status: 502 });
    }
  }

  return NextResponse.json({ reportId: row.id, redirect: `/reports/${row.id}` });
}
