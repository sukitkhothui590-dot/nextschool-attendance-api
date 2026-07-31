export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="surface-card p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-9 w-16" />
    </div>
  );
}
