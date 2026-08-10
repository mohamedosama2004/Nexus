import ProjectStatusBadge from "@/src/components/projectStatusBadge";
import CreateTaskModal from "./createTaskModal";
import type { ProjectWithTasks } from "./types";

type Props = {
  projectId: string;
  tasks: ProjectWithTasks["tasks"];
};

export default function ProjectTasks({ projectId, tasks }: Props) {
  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="justify-self-end">
            <CreateTaskModal projectId={projectId} />
          </div>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-base-content/60">No tasks yet.</p>
        ) : (
          <ul className="divide-y divide-base-200">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium">{task.title}</p>
                  {task.description && (
                    <p className="truncate text-sm text-base-content/60">
                      {task.description}
                    </p>
                  )}
                  <p className="text-xs text-base-content/40">#{task.id}</p>
                </div>
                <ProjectStatusBadge status={task.status} outline />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
