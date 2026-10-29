import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsLoading() {
  return (
    <div>
      <Skeleton style={{ height: 26, width: 180, marginBottom: 8 }} />
      <Skeleton style={{ height: 14, width: 300, marginBottom: 18 }} />
      <div className="aq-cols-cards">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} style={{ height: 168, borderRadius: 14 }} />
        ))}
      </div>
    </div>
  );
}
