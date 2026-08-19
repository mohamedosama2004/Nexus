export default function ProjectsSkeleton() {
  return (
    <section className="rounded-xl border border-base-200 bg-base-100">
      <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
        <div className="skeleton h-5 w-36 rounded-lg" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-base-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="skeleton h-4 w-3/4 rounded-lg" />
                <div className="skeleton h-5 w-16 shrink-0 rounded-full" />
              </div>
              <div className="skeleton mt-2 h-3 w-full rounded-lg" />
              <div className="skeleton mt-1 h-3 w-2/3 rounded-lg" />
              <div className="skeleton mt-3 h-3 w-12 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
