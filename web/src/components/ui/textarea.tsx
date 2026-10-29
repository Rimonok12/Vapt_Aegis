'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { styled } from '@yak/react';

import { cn } from '@/lib/utils';
import { durationBase, easeOut, radiusMd, textBase } from '@/styles/tokens';

const Area = styled.textarea`
  width: 100%;
  min-height: 104px;
  padding: 10px 12px;
  border-radius: ${radiusMd};
  border: 1px solid var(--aq-border-strong);
  background: var(--aq-card);
  color: var(--aq-fg);
  font-size: ${textBase};
  line-height: 1.5;
  resize: vertical;
  transition:
    border-color ${durationBase} ${easeOut},
    box-shadow ${durationBase} ${easeOut};
  box-shadow: var(--aq-shadow-sm);

  &::placeholder {
    color: var(--aq-muted-fg);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--aq-ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--aq-ring) 22%, transparent);
  }

  &[aria-invalid='true'] {
    border-color: var(--aq-destructive);
  }
`;

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <Area ref={ref} className={cn(className)} {...props} />;
});
