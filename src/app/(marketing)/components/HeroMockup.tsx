const projects = [
  { name: "Website Redesign", status: "Active", progress: 72, tasks: 24, done: 17 },
  { name: "Mobile App v2", status: "In Progress", progress: 45, tasks: 38, done: 17 },
  { name: "API Integration", status: "Active", progress: 88, tasks: 16, done: 14 },
];

const recentTasks = [
  { title: "Design system updates", assignee: "A", status: "Done", color: "bg-success" },
  { title: "API endpoint testing", assignee: "J", status: "In Progress", color: "bg-info" },
  { title: "User onboarding flow", assignee: "T", status: "To Do", color: "bg-base-300" },
  { title: "Performance audit", assignee: "C", status: "In Progress", color: "bg-info" },
  { title: "Database migration", assignee: "R", status: "Done", color: "bg-success" },
];

export function HeroMockup() {
  return (
    <div className="rounded-2xl border border-base-200 bg-base-100 shadow-2xl shadow-primary/5">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-base-200 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-base-300" />
          <div className="h-3 w-3 rounded-full bg-base-300" />
          <div className="h-3 w-3 rounded-full bg-base-300" />
        </div>
        <div className="ml-4 flex-1 rounded-lg bg-base-200/60 px-3 py-1.5 text-xs text-base-content/40">
          nexus.app/dashboard/projects
        </div>
      </div>

      <div className="flex min-h-[320px] lg:min-h-[400px]">
        {/* Sidebar */}
        <div className="hidden w-48 shrink-0 border-r border-base-200 p-3 lg:block">
          <div className="mb-4 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-bold text-primary-content text-xs">
              N
            </div>
            <span className="text-sm font-semibold">Nexus</span>
          </div>
          <nav className="flex flex-col gap-0.5">
            {["Dashboard", "Projects", "Tasks", "Team", "Settings"].map(
              (item, i) => (
                <div
                  key={item}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    i === 1
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-base-content/50"
                  }`}
                >
                  {item}
                </div>
              )
            )}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-3 gap-3 lg:mb-6">
            {[
              { label: "Active projects", value: "12" },
              { label: "Open tasks", value: "48" },
              { label: "Team members", value: "8" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-base-200 bg-base-200/30 p-3 text-center"
              >
                <div className="text-lg font-bold text-base-content">{stat.value}</div>
                <div className="text-xs text-base-content/50">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Two columns: projects + tasks */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Projects */}
            <div className="rounded-xl border border-base-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-base-content">Projects</h3>
              <div className="flex flex-col gap-2.5">
                {projects.map((p) => (
                  <div key={p.name} className="rounded-lg bg-base-200/40 p-2.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-base-content">{p.name}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {p.status}
                      </span>
                    </div>
                    <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-base-300">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-base-content/40">
                      {p.done}/{p.tasks} tasks
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="rounded-xl border border-base-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-base-content">Recent tasks</h3>
              <div className="flex flex-col gap-2">
                {recentTasks.map((t) => (
                  <div
                    key={t.title}
                    className="flex items-center gap-3 rounded-lg bg-base-200/40 p-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-base-300 text-[10px] font-bold text-base-content/60">
                      {t.assignee}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-base-content">
                        {t.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${t.color}`} />
                      <span className="whitespace-nowrap text-[10px] text-base-content/50">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
