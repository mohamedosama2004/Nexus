import ProjectStatusBadge from "@/src/components/projectStatusBadge";
import type { ProjectWithTasks } from "./types";

type Props = {
  project: ProjectWithTasks;
};

export default function ProjectHeader({ project }: Props) {
  return (
    <header className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="card-title text-2xl">{project.title}</h1>
            <p className="text-sm text-base-content/60">
              {project.description || "No description provided."}
            </p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <div className="divider divider-neutral my-1" />

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <dt className="text-base-content/60">Project ID</dt>
            <dd className="font-mono text-base-content/80">{project.id}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base-content/60">Workspace ID</dt>
            <dd className="font-mono text-base-content/80">
              {project.workspaceId}
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
