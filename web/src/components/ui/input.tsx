'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { styled } from '@yak/react';

import { cn } from '@/lib/utils';
import { durationBase, easeOut, radiusMd, textBase } from '@/styles/tokens';

const Field = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: ${radiusMd};
  border: 1px solid var(--aq-border-strong);
  background: var(--aq-card);
  color: var(--aq-fg);
  font-size: ${textBase};
  transition:
    border-color ${durationBase} ${easeOut},
    box-shadow ${durationBase} ${easeOut};
  box-shadow: var(--aq-shadow-sm);

  &::placeholder {
    color: var(--aq-muted-fg);
  }

  &:hover:not(:disabled) {
    border-color: color-mix(in oklab, var(--aq-ring) 45%, var(--aq-border-strong));
  }

  &:focus-visible {
    outline: none;
    border-color: var(--aq-ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--aq-ring) 22%, transparent);
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
