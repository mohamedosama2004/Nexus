import { getTasks } from "@/src/lib/data/tasks";

export default async function Tasks() {
  const tasks = await getTasks();

  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="card-title">
          Task Progress
          <span className="badge badge-primary">{completionRate}%</span>
        </div>

        <progress
          className="progress progress-primary w-full"
          value={completionRate}
          max={100}
        />

        <p className="text-sm text-base-content/60">
          {completedTasks} of {tasks.length} tasks completed
        </p>

        <div className="divider divider-primary my-1" />

        <ul className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={task.completed}
                className="checkbox checkbox-primary checkbox-sm"
                disabled
              />
              <span
                className={`text-sm flex-1 line-clamp-1 ${
                  task.completed
                    ? "text-base-content/40 line-through"
                    : "text-base-content"
                }`}
              >
                {task.title}
              </span>
              <span className="badge badge-sm badge-ghost">#{task.userId}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
