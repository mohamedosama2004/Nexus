export default function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-base-200 bg-base-100 p-5"
        >
          <div className="flex items-center justify-between">
            <div className="skeleton size-10 rounded-lg" />
          </div>
          <div className="mt-4">
            <div className="skeleton h-8 w-16 rounded-lg" />
            <div className="skeleton mt-2 h-4 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
