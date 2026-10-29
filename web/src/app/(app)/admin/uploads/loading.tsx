import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div>
      <Skeleton style={{ height: 26, width: 200, marginBottom: 8 }} />
      <Skeleton style={{ height: 14, width: 320, marginBottom: 18 }} />
      <Skeleton style={{ height: 340, borderRadius: 14, maxWidth: 620 }} />
    </div>
  );
}
