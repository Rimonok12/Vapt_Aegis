'use client';

import { useState, useTransition } from 'react';
import { Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ReportRow } from '@/lib/types';

// The PDF engine only ships for the browser; load it on demand so it never
// touches the server bundle or the initial JS payload.

export function PdfExport({ report }: { report: ReportRow }) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const [{ pdf }, { ReportPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/reports/report-pdf'),
      ]);
      const instance = pdf(<ReportPdfDocument report={report} />);
      const blob = await instance.toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `aegis-${slug(report.title)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4_000);
    } catch (error) {
      console.error('PDF export failed', error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => startTransition(handleExport)}
      disabled={busy || pending}
    >
      {busy ? <Loader2 size={14} className="aq-spin" /> : <Download size={14} />}
      {busy ? 'Building…' : 'Export PDF'}
    </Button>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}
