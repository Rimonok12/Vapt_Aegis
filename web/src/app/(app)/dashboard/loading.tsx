import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <Skeleton style={{ height: 26, width: 200, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 300 }} />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
          gap: 14,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} style={{ height: 108, borderRadius: 14 }} />
        ))}
      </div>
      <div className="aq-cols-main-side">
        <Skeleton style={{ height: 300, borderRadius: 14 }} />
        <Skeleton style={{ height: 300, borderRadius: 14 }} />
      </div>
      <div className="aq-cols-cards">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} style={{ height: 168, borderRadius: 14 }} />
        ))}
      </div>
    </div>
  );
}
