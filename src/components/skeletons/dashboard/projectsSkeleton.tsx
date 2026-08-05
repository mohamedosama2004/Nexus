export default function ProjectsSkeleton() {
  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <div className="skeleton h-6 w-40 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <article
              key={index}
              className="rounded-box border border-base-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="skeleton h-5 w-3/4 rounded-lg" />
                <div className="skeleton h-5 w-20 shrink-0 rounded-full" />
              </div>
              <div className="skeleton mt-2 h-4 w-full rounded-lg" />
              <div className="skeleton mt-1 h-4 w-5/6 rounded-lg" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
