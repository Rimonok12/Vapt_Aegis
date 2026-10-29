'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, Loader2, UploadCloud, X } from 'lucide-react';
import { styled } from '@yak/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError, FieldDescription } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { radiusMd, textSm, textXs } from '@/styles/tokens';

const ACCEPT = '.nessus,.nmap,.xml,.json';
const MAX_BYTES = 25 * 1024 * 1024;

const Drop = styled.label`
  display: grid;
  gap: 8px;
  place-content: center;
  align-items: center;
  border: 1.5px dashed var(--aq-border-strong);
  border-radius: ${radiusMd};
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  color: var(--aq-muted-fg);
  transition:
    border-color 160ms ease,
    background-color 160ms ease;

  &:hover,
  &:focus-within {
    border-color: var(--aq-primary);
    background: var(--aq-primary-soft);
  }

  & input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 9px 12px;
  border: 1px solid var(--aq-border);
  border-radius: ${radiusMd};
  background: var(--aq-muted);
  font-size: ${textSm};

  & span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Remove = styled.button`
  display: inline-flex;
  color: var(--aq-muted-fg);

  &:hover {
    color: var(--aq-destructive);
  }
`;

const Hint = styled.p`
  font-size: ${textXs};
  color: var(--aq-muted-fg);
  line-height: 1.6;
`;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;
    setError(null);
    if (picked && picked.size > MAX_BYTES) {
      setFile(null);
      setError('That file is larger than the 25 MB limit.');
      return;
    }
    setFile(picked);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError('Choose a scan export first.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append('file', file);
      if (title.trim()) payload.append('title', title.trim());

      const response = await fetch('/api/admin/upload', { method: 'POST', body: payload });
      const json = (await response.json()) as { message?: string; redirect?: string };

      if (!response.ok) {
        setError(json.message ?? 'Upload failed. Please try again.');
        setBusy(false);
        return;
      }

      setTitle('');
      setFile(null);
      setBusy(false);
      router.push(json.redirect ?? '/reports');
      router.refresh();
    } catch {
      setError('Network error — the upload could not reach the server.');
      setBusy(false);
    }
  }

  return (
    <Card style={{ maxWidth: 620 }}>
      <CardHeader>
        <CardTitle>Upload a scan export</CardTitle>
        <CardDescription>
          Raw Nessus, Nmap or JSON output. The parser strips hostnames, IP addresses and credentials
          before anything is stored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Drop>
              <UploadCloud size={22} />
              <span style={{ fontSize: textSm, fontWeight: 550 }}>
                {file ? 'Choose a different file' : 'Browse for a scan file'}
              </span>
              <Hint>{ACCEPT.split(',').join(' · ')} — up to 25 MB</Hint>
              <input type="file" accept={ACCEPT} onChange={pick} required={!file} />
            </Drop>
            {file && (
              <FileName>
                <FileUp size={14} />
                <span>{file.name}</span>
                <em style={{ color: 'var(--aq-muted-fg)', fontStyle: 'normal', fontSize: textXs }}>
                  {formatBytes(file.size)}
                </em>
                <Remove type="button" onClick={() => setFile(null)} aria-label="Remove file">
                  <X size={14} />
                </Remove>
              </FileName>
            )}
          </div>

          <div>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Report title (optional)"
              maxLength={120}
            />
            <FieldDescription>
              Leave blank to use the filename. Shown to everyone in your organisation.
            </FieldDescription>
          </div>

          {error && <FieldError>{error}</FieldError>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button type="submit" disabled={busy || !file}>
              {busy ? <Loader2 size={14} className="aq-spin" /> : <UploadCloud size={14} />}
              {busy ? 'Sending to parser…' : 'Upload & process'}
            </Button>
            {busy && <Badge tone="info">Parsing + AI drafting</Badge>}
          </div>

          <Hint>
            Processing usually takes under a minute. You can watch progress on the report page — the
            file itself is discarded after sanitisation.
          </Hint>
        </form>
      </CardContent>
    </Card>
  );
}
