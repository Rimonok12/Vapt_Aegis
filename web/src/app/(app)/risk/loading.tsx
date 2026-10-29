import { Skeleton } from '@/components/ui/skeleton';

export default function RiskLoading() {
  return (
    <div>
      <Skeleton style={{ height: 26, width: 200, marginBottom: 8 }} />
      <Skeleton style={{ height: 14, width: 340, marginBottom: 18 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 14 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Skeleton style={{ height: 260, borderRadius: 14 }} />
          <Skeleton style={{ height: 320, borderRadius: 14 }} />
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <Skeleton style={{ height: 54, borderRadius: 10 }} />
          <Skeleton style={{ height: 54, borderRadius: 10 }} />
          <Skeleton style={{ height: 54, borderRadius: 10 }} />
          <Skeleton style={{ height: 380, borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}
