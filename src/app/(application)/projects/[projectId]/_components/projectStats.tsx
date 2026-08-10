import type { ProjectWithTasks } from "./types";

type Props = {
  tasks: ProjectWithTasks["tasks"];
};

export default function ProjectStats({ tasks }: Props) {
  const taskStatuses = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="stats stats-vertical w-full shadow-sm lg:stats-horizontal">
      <div className="stat">
        <div className="stat-title">Total Tasks</div>
        <div className="stat-value text-primary">{tasks.length}</div>
      </div>
      {Object.entries(taskStatuses).map(([status, count]) => (
        <div key={status} className="stat">
          <div className="stat-title">{status}</div>
          <div className="stat-value">{count}</div>
        </div>
      ))}
    </div>
  );
}
