'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { SubmitButton } from '@/components/ui/submit-button';
import { deleteAudit } from '@/lib/audits/actions';

/** Two-step delete: the first click arms the button, the second deletes. */
export function DeleteAuditButton({ auditId }: { auditId: string }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <form
      action={deleteAudit.bind(null, auditId)}
      onSubmit={(event) => {
        if (!armed) {
          event.preventDefault();
          setArmed(true);
        }
      }}
    >
      <SubmitButton variant={armed ? 'destructive' : 'ghost'} size="sm" pendingLabel="Deleting…">
        <Trash2 size={14} /> {armed ? 'Click again to delete' : 'Delete'}
      </SubmitButton>
    </form>
  );
}
