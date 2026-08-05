export default function ProjectCardSkeleton() {
  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <div className="skeleton h-40 w-full rounded-box" />

        <div className="space-y-2">
          <div className="skeleton h-5 w-3/4 rounded-lg" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
        </div>

        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>

        <div className="space-y-1">
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-4 w-5/6 rounded-lg" />
        </div>

        <div className="flex items-center gap-3">
          <div className="skeleton size-8 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-24 rounded-lg" />
            <div className="skeleton h-3 w-16 rounded-lg" />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="skeleton h-10 flex-1 rounded-lg" />
          <div className="skeleton h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
