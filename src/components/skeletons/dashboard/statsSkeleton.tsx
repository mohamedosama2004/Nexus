export default function StatsSkeleton() {
  return (
    <div className="stats stats-vertical w-full shadow-sm lg:stats-horizontal">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="stat">
          <div className="stat-figure">
            <div className="skeleton size-8 rounded-full" />
          </div>
          <div className="skeleton h-3 w-16 rounded-lg" />
          <div className="skeleton mt-2 h-8 w-20 rounded-lg" />
          <div className="skeleton mt-1 h-3 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
