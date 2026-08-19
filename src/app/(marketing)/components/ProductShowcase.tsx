export function ProductShowcase() {
  return (
    <section id="product-showcase" className="bg-base-200/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            A workspace that adapts to how you work
          </h2>
          <p className="mt-4 text-lg text-base-content/60">
            From daily standups to quarterly planning, Nexus gives your team
            full visibility into every project.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border border-base-200 bg-base-100 shadow-2xl shadow-primary/5">
            <div className="flex min-h-[420px] lg:min-h-[480px]">
              {/* Sidebar */}
              <div className="hidden w-56 shrink-0 flex-col border-r border-base-200 p-4 lg:flex">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-content text-sm">
                    N
                  </div>
                  <span className="text-base font-semibold">Nexus</span>
                </div>

                <nav className="flex flex-1 flex-col gap-0.5">
                  {[
                    { name: "Dashboard", active: false },
                    { name: "Projects", active: true },
                    { name: "My Tasks", active: false },
                    { name: "Team", active: false },
                    { name: "Settings", active: false },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        item.active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-base-content/50"
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-base-content">
                      Website Redesign
                    </h3>
                    <p className="mt-1 text-sm text-base-content/50">
                      Marketing website overhaul — Q3 launch
                    </p>
                  </div>
                  <div className="flex items-center -space-x-2">
                    {["A", "J", "T", "C"].map((initial) => (
                      <div
                        key={initial}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-base-100 bg-primary/20 text-xs font-bold text-primary"
                      >
                        {initial}
                      </div>
                    ))}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-base-100 bg-base-200 text-[10px] font-bold text-base-content/50">
                      +4
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-base-content">Overall progress</span>
                    <span className="text-primary font-semibold">72%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-base-200">
                    <div className="h-full w-[72%] rounded-full bg-primary" />
                  </div>
                </div>

                {/* Status columns */}
                <div className="grid grid-cols-3 gap-4">
                  {/* To Do */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-base-300" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                        To Do
                      </span>
                      <span className="rounded-full bg-base-200 px-1.5 py-0.5 text-[10px] font-medium text-base-content/40">
                        3
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {["Update footer copy", "SEO audit", "Analytics setup"].map(
                        (task) => (
                          <div
                            key={task}
                            className="rounded-lg border border-base-200 bg-base-200/30 p-2.5"
                          >
                            <div className="text-xs font-medium text-base-content">
                              {task}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1">
                              <span className="rounded bg-base-300 px-1.5 py-0.5 text-[9px] font-medium text-base-content/40">
                                Low
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* In Progress */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-info" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                        In Progress
                      </span>
                      <span className="rounded-full bg-base-200 px-1.5 py-0.5 text-[10px] font-medium text-base-content/40">
                        2
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {["Homepage redesign", "Navigation update"].map(
                        (task) => (
                          <div
                            key={task}
                            className="rounded-lg border border-base-200 bg-base-200/30 p-2.5"
                          >
                            <div className="text-xs font-medium text-base-content">
                              {task}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1">
                              <span className="rounded bg-info/10 px-1.5 py-0.5 text-[9px] font-medium text-info">
                                High
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Done */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                        Done
                      </span>
                      <span className="rounded-full bg-base-200 px-1.5 py-0.5 text-[10px] font-medium text-base-content/40">
                        4
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        "Brand guidelines",
                        "Component library",
                        "Content strategy",
                        "Wireframes",
                      ].map((task) => (
                        <div
                          key={task}
                          className="rounded-lg border border-base-200 bg-base-200/30 p-2.5"
                        >
                          <div className="text-xs font-medium text-base-content/50 line-through">
                            {task}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
