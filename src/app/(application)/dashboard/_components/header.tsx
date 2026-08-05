export default function DashboardHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Dashboard</h1>
        <p className="text-sm text-base-content/60">
          Overview of your workspace activity
        </p>
      </div>
      <div className="badge badge-primary gap-2 py-3">
        <span className="size-2 animate-pulse rounded-full bg-primary-content" />
        Live data
      </div>
    </header>
  );
}
