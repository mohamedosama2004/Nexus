import { getTasks } from "@/src/lib/data/tasks";

export default async function Tasks() {
  const tasks = await getTasks();

  const completedTasks = tasks.filter((task) => task.status === "done" || task.status === "completed").length;
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  return (
    <section className="rounded-xl border border-base-200 bg-base-100">
      <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
        <h2 className="text-base font-semibold text-base-content">Task Progress</h2>
        <span className="text-sm font-semibold text-primary">{completionRate}%</span>
      </div>

      <div className="p-5">
        {/* Progress bar */}
        <div className="mb-1 h-2 overflow-hidden rounded-full bg-base-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="mb-5 text-xs text-base-content/50">
          {completedTasks} of {tasks.length} tasks completed
        </p>

        {/* Task list */}
        <ul className="flex flex-col gap-1">
          {tasks.slice(0, 6).map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-base-200/50"
            >
              <div
                className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                  task.status === "done" || task.status === "completed"
                    ? "border-primary bg-primary text-primary-content"
                    : "border-base-300"
                }`}
              >
                {(task.status === "done" || task.status === "completed") && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span
                className={`flex-1 text-sm ${
                  task.status === "done" || task.status === "completed"
                    ? "text-base-content/40 line-through"
                    : "text-base-content"
                }`}
              >
                {task.title}
              </span>
              <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-medium text-base-content/50">
                {task.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
