export default function TasksSkeleton() {
  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <div className="skeleton h-6 w-40 rounded-lg" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>

        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-3 w-48 rounded-lg" />

        <div className="divider my-1" />

        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="skeleton size-5 shrink-0 rounded" />
              <div className="skeleton h-4 flex-1 rounded-lg" />
              <div className="skeleton h-5 w-10 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
