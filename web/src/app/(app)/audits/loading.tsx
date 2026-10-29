import { Skeleton } from '@/components/ui/skeleton';

export default function AuditsLoading() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Skeleton style={{ height: 26, width: 180 }} />
      <Skeleton style={{ height: 14, width: 340, marginBottom: 8 }} />
      <Skeleton style={{ height: 220, borderRadius: 14 }} />
      <div className="aq-cols-cards">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} style={{ height: 100, borderRadius: 14 }} />
        ))}
      </div>
    </div>
  );
}
