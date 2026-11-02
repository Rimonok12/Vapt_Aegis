'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { styled } from '@yak/react';

import { cn } from '@/lib/utils';
import { durationBase, easeOut, radiusMd, textBase } from '@/styles/tokens';

/* Frosted-glass field with a faint blue edge and a soft glow on focus. */
const Field = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: ${radiusMd};
  border: 1px solid color-mix(in oklab, var(--aq-primary) 16%, var(--aq-border-strong));
  background-color: var(--aq-glass-strong);
  backdrop-filter: blur(10px) saturate(1.3);
  color: var(--aq-fg);
  font-size: ${textBase};
  transition:
    border-color ${durationBase} ${easeOut},
    box-shadow ${durationBase} ${easeOut},
    background-color ${durationBase} ${easeOut};
  box-shadow:
    inset 0 1px 2px oklch(0.2 0.05 260 / 0.06),
    0 1px 0 var(--aq-glass-shine);

  &::placeholder {
    color: color-mix(in oklab, var(--aq-muted-fg) 80%, transparent);
  }

  &:hover:not(:disabled) {
    border-color: color-mix(in oklab, var(--aq-primary) 40%, var(--aq-border-strong));
  }

  &:focus-visible {
    outline: none;
    border-color: var(--aq-primary);
    background-color: var(--aq-card);
    box-shadow:
      0 0 0 4px color-mix(in oklab, var(--aq-primary) 16%, transparent),
      0 8px 24px -12px var(--aq-grad-glow);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &[aria-invalid='true'] {
    border-color: var(--aq-destructive);
  }
`;

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return <Field ref={ref} className={cn(className)} {...props} />;
});
