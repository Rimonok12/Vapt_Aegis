import { Skeleton } from '@/components/ui/skeleton';

export default function ReportDetailLoading() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Skeleton style={{ height: 28, width: 320 }} />
      <Skeleton style={{ height: 14, width: 260, marginBottom: 8 }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
          gap: 14,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} style={{ height: 104, borderRadius: 14 }} />
        ))}
      </div>
      <div className="aq-cols-main-side">
        <Skeleton style={{ height: 420, borderRadius: 14 }} />
        <Skeleton style={{ height: 420, borderRadius: 14 }} />
      </div>
    </div>
  );
}
