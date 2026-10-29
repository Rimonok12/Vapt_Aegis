'use client';

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, Loader2, UploadCloud, X } from 'lucide-react';
import { styled } from '@yak/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError, FieldDescription } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from '@/lib/utils';
import { radiusMd, textSm, textXs } from '@/styles/tokens';

const ACCEPT = '.nessus,.nmap,.xml,.json';

const Drop = styled.label`
  position: relative;
  display: grid;
  gap: 8px;
  justify-items: center;
  border: 1.5px dashed var(--aq-border-strong);
  border-radius: ${radiusMd};
  padding: 34px 20px;
  text-align: center;
  cursor: pointer;
  color: var(--aq-muted-fg);
  background: color-mix(in oklab, var(--aq-muted) 45%, transparent);
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;

  &:hover,
  &:focus-within,
  &[data-dragging='true'] {
    border-color: var(--aq-primary);
    background: var(--aq-primary-soft);
    color: var(--aq-fg);
  }

  &[data-dragging='true'] {
    transform: scale(1.01);
  }

  & input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
`;

const DropIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--aq-card);
  color: var(--aq-primary);
  box-shadow:
    var(--aq-shadow-sm),
    0 0 0 6px color-mix(in oklab, var(--aq-primary) 10%, transparent);
  margin-bottom: 4px;
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
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function accept(picked: File | null) {
    setError(null);
    if (picked && picked.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setError(`That file is larger than the ${MAX_UPLOAD_MB} MB limit.`);
      return;
    }
    if (picked && !ACCEPT.split(',').some((ext) => picked.name.toLowerCase().endsWith(ext))) {
      setFile(null);
      setError('Unsupported file type. Upload a .nessus, .nmap, .xml or .json export.');
      return;
    }
    setFile(picked);
  }

  function pick(event: ChangeEvent<HTMLInputElement>) {
    accept(event.target.files?.[0] ?? null);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files?.[0] ?? null);
  }

  function clearFile() {
    setFile(null);
    // Reset the native input so picking the same file again still fires onChange.
    if (inputRef.current) inputRef.current.value = '';
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
      // Platform errors (413 payload too large, 504 timeout) are not JSON.
      const json = (await response.json().catch(() => ({
        message:
          response.status === 413
            ? `That file is too large for this server (max ${MAX_UPLOAD_MB} MB).`
            : `Upload failed (HTTP ${response.status}). Please try again.`,
      }))) as { message?: string; redirect?: string };

      if (!response.ok) {
        setError(json.message ?? 'Upload failed. Please try again.');
        setBusy(false);
        return;
      }

      setTitle('');
      clearFile();
      setBusy(false);
      router.push(json.redirect ?? '/reports');
      router.refresh();
    } catch {
      setError('Network error — the upload could not reach the server.');
      setBusy(false);
    }
  }

  return (
    <Card style={{ maxWidth: 680 }}>
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
            <Drop
              data-dragging={dragging}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <DropIcon>
                <UploadCloud size={20} />
              </DropIcon>
              <span style={{ fontSize: textSm, fontWeight: 600, color: 'var(--aq-fg)' }}>
                {file ? 'Choose a different file' : 'Drop a scan file here, or browse'}
              </span>
              <Hint>{ACCEPT.split(',').join(' · ')} — up to {MAX_UPLOAD_MB} MB</Hint>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                onChange={pick}
                required={!file}
              />
            </Drop>
            {file && (
              <FileName>
                <FileUp size={14} />
                <span>{file.name}</span>
                <em style={{ color: 'var(--aq-muted-fg)', fontStyle: 'normal', fontSize: textXs }}>
                  {formatBytes(file.size)}
                </em>
                <Remove type="button" onClick={clearFile} aria-label="Remove file">
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
