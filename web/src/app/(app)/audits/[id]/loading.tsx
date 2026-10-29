import { Skeleton } from '@/components/ui/skeleton';

export default function AuditLoading() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Skeleton style={{ height: 28, width: 320 }} />
      <Skeleton style={{ height: 14, width: 220, marginBottom: 8 }} />
      <div className="aq-cols-main-side">
        <Skeleton style={{ height: 520, borderRadius: 14 }} />
        <Skeleton style={{ height: 360, borderRadius: 14 }} />
      </div>
    </div>
  );
}
