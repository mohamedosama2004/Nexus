import { getCurrentUser } from "@/src/lib/auth";

export default async function DashboardHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-base-content">
          Welcome back{user ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-0.5 text-sm text-base-content/50">
          Overview of your workspace activity
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-base-200 bg-base-100 px-3 py-1.5">
        <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
        <span className="text-sm font-medium text-base-content/70">Live data</span>
      </div>
    </header>
  );
}
