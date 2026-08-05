export default function ActivitySkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="card-title">
            <div className="skeleton h-6 w-40 rounded-lg" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-box border border-base-200 p-4"
              >
                <div className="skeleton size-11 shrink-0 rounded-full" />
                <div className="min-w-0 space-y-1.5">
                  <div className="skeleton h-4 w-28 rounded-lg" />
                  <div className="skeleton h-3 w-36 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="card-title">
            <div className="skeleton h-6 w-32 rounded-lg" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-box border border-base-200 bg-base-200/50 p-3"
              >
                <div className="skeleton h-4 w-full rounded-lg" />
                <div className="skeleton mt-2 h-3 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
