export function MembersSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-base-200 bg-base-100 p-4"
        >
          <div className="skeleton size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-56" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
