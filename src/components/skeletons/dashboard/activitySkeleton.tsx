export default function ActivitySkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Team Members skeleton */}
      <section className="rounded-xl border border-base-200 bg-base-100">
        <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
          <div className="skeleton h-5 w-32 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-base-200 p-3"
              >
                <div className="skeleton size-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-28 rounded-lg" />
                  <div className="skeleton h-3 w-36 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attachments skeleton */}
      <section className="rounded-xl border border-base-200 bg-base-100">
        <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
          <div className="skeleton h-5 w-28 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-base-200 bg-base-200/30 p-3"
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
