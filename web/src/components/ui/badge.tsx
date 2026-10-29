import type { HTMLAttributes } from 'react';
import { styled } from '@yak/react';

import { cn } from '@/lib/utils';
import { radiusSm, textXs } from '@/styles/tokens';

const Root = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: ${radiusSm};
  border: 1px solid var(--aq-border);
  padding: 2px 8px;
  font-size: ${textXs};
  font-weight: 550;
  letter-spacing: 0.01em;
  line-height: 1.6;
  white-space: nowrap;
  width: fit-content;

  &[data-tone='neutral'] {
    background: var(--aq-muted);
    color: var(--aq-muted-fg);
    border-color: transparent;
  }

  &[data-tone='primary'] {
    background: color-mix(in oklab, var(--aq-primary) 14%, transparent);
    color: var(--aq-primary);
    border-color: color-mix(in oklab, var(--aq-primary) 30%, transparent);
  }

  &[data-tone='success'] {
    background: color-mix(in oklab, var(--aq-success) 16%, transparent);
    color: var(--aq-success);
    border-color: color-mix(in oklab, var(--aq-success) 34%, transparent);
  }

  &[data-tone='warning'] {
    background: color-mix(in oklab, var(--aq-warning) 18%, transparent);
    color: color-mix(in oklab, var(--aq-warning) 70%, var(--aq-fg));
    border-color: color-mix(in oklab, var(--aq-warning) 38%, transparent);
  }

  &[data-tone='destructive'] {
    background: color-mix(in oklab, var(--aq-destructive) 14%, transparent);
    color: var(--aq-destructive);
    border-color: color-mix(in oklab, var(--aq-destructive) 32%, transparent);
  }

  &[data-tone='outline'] {
    background: transparent;
    color: var(--aq-muted-fg);
  }

  &[data-tone='critical'] {
    background: color-mix(in oklab, var(--aq-sev-critical) 16%, transparent);
    color: var(--aq-sev-critical);
    border-color: color-mix(in oklab, var(--aq-sev-critical) 36%, transparent);
  }

  &[data-tone='high'] {
    background: color-mix(in oklab, var(--aq-sev-high) 16%, transparent);
    color: var(--aq-sev-high);
    border-color: color-mix(in oklab, var(--aq-sev-high) 36%, transparent);
  }

  &[data-tone='medium'] {
    background: color-mix(in oklab, var(--aq-sev-medium) 18%, transparent);
    color: color-mix(in oklab, var(--aq-sev-medium) 62%, var(--aq-fg));
    border-color: color-mix(in oklab, var(--aq-sev-medium) 38%, transparent);
  }

  &[data-tone='low'] {
    background: color-mix(in oklab, var(--aq-sev-low) 16%, transparent);
    color: var(--aq-sev-low);
    border-color: color-mix(in oklab, var(--aq-sev-low) 36%, transparent);
  }

  &[data-tone='info'] {
    background: color-mix(in oklab, var(--aq-sev-info) 16%, transparent);
    color: var(--aq-muted-fg);
    border-color: color-mix(in oklab, var(--aq-sev-info) 30%, transparent);
  }
`;

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info';

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <Root data-tone={tone} className={cn(className)} {...props} />;
}
