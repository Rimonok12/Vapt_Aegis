'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';

/**
 * Submit button for server-action forms: disables itself and shows a spinner
 * while the action runs, so a slow response cannot be double-submitted.
 */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: Omit<ButtonProps, 'type'> & { pendingLabel?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} type="submit" disabled={pending || props.disabled} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 size={15} className="aq-spin" /> {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
