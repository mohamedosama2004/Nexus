import CreateTaskModal from "../createTaskModal";
import ProjectMembersStack from "../projectMembersStack";
import type { ProjectWithMembersAndTasks } from "../types";

type BoardHeaderProps = {
  project: ProjectWithMembersAndTasks;
  projectId: string;
};

export function BoardHeader({ project, projectId }: BoardHeaderProps) {
  return (
    <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-base-content">
          {project.title}
        </h2>
        <p className="mt-0.5 text-sm text-base-content/50">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ProjectMembersStack members={project.members} />
        <CreateTaskModal projectId={projectId} />
      </div>
    </div>
  );
}
