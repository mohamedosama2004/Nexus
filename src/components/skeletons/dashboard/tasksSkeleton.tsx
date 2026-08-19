export default function TasksSkeleton() {
  return (
    <section className="rounded-xl border border-base-200 bg-base-100">
      <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
        <div className="skeleton h-5 w-32 rounded-lg" />
        <div className="skeleton h-5 w-10 rounded-lg" />
      </div>
      <div className="p-5">
        <div className="skeleton mb-1 h-2 w-full rounded-full" />
        <div className="skeleton mb-5 h-3 w-40 rounded-lg" />

        <ul className="flex flex-col gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="skeleton size-5 shrink-0 rounded" />
              <div className="skeleton h-4 flex-1 rounded-lg" />
              <div className="skeleton h-5 w-16 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
