import { Skeleton } from '@/components/ui/skeleton';

export default function TenantsLoading() {
  return (
    <div>
      <Skeleton style={{ height: 26, width: 220, marginBottom: 8 }} />
      <Skeleton style={{ height: 14, width: 300, marginBottom: 18 }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <Skeleton style={{ height: 24, width: 90 }} />
        <Skeleton style={{ height: 24, width: 110 }} />
        <Skeleton style={{ height: 24, width: 90 }} />
      </div>
      <Skeleton style={{ height: 320, borderRadius: 14 }} />
    </div>
  );
}
