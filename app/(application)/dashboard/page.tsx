import { getAttachments } from "@/lib/data/attachments";
import { getUsers } from "@/lib/data/members";
import { getProjects } from "@/lib/data/projects";
import { getTasks } from "@/lib/data/tasks";

export default async function DashboardPage() {
  const [users, projects, tasks, attachments] = await Promise.all([
    getUsers(),
    getProjects(),
    getTasks(),
    getAttachments(),
  ]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const stats = [
    { label: "Users", value: users.length, icon: "👥" },
    { label: "Projects", value: projects.length, icon: "📝" },
    { label: "Tasks", value: tasks.length, icon: "✅" },
    { label: "Attachments", value: attachments.length, icon: "📎" },
  ];

  return (
    <div className="space-y-6">
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

      <div className="stats stats-vertical w-full shadow-sm lg:stats-horizontal">
        {stats.map((stat) => (
          <div key={stat.label} className="stat">
            <div className="stat-figure text-2xl">{stat.icon}</div>
            <div className="stat-title">{stat.label}</div>
            <div className="stat-value text-primary">{stat.value}</div>
            <div className="stat-desc">Total in workspace</div>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card border border-base-200 bg-base-100 shadow-sm lg:col-span-2">
          <div className="card-body">
            <div className="card-title">
              Recent Projects
              <span className="badge badge-ghost">{projects.length} total</span>
            </div>

            <div className="space-y-2">
              {projects.slice(0, 6).map((post) => (
                <article
                  key={post.id}
                  className="rounded-box border border-base-200 p-4 transition-colors hover:border-primary/40 hover:bg-base-200/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-base-content line-clamp-1">
                      {post.title}
                    </h3>
                    <span className="badge badge-sm badge-outline shrink-0">
                      by user #{post.userId}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-base-content/60 line-clamp-2">
                    {post.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card border border-base-200 bg-base-100 shadow-sm">
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
                    <span className="badge badge-sm badge-ghost">
                      #{task.userId}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card border border-base-200 bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="card-title">
                Attachments
                <span className="badge badge-ghost">
                  {attachments.length} albums
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {attachments.slice(0, 6).map((album) => (
                  <div
                    key={album.id}
                    className="rounded-box border border-base-200 bg-base-200/50 p-3"
                  >
                    <p className="text-sm font-medium text-base-content line-clamp-2">
                      {album.title}
                    </p>
                    <span className="mt-1 inline-block text-xs text-base-content/50">
                      #{album.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="card-title">
            Team Members
            <span className="badge badge-ghost">{users.length} users</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-box border border-base-200 p-4 transition-colors hover:border-primary/40 hover:bg-base-200/50"
              >
                <div className="avatar placeholder">
                  <div className="w-11 rounded-full bg-primary text-primary-content">
                    <span className="font-bold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-base-content truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-base-content/60 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
