import { FolderIcon } from "@heroicons/react/24/outline";

import {
  getProjectTaskStats,
  getProjectsBySearch,
} from "@/src/lib/data/projectsSearch";
import type { ProjectStatus } from "@/src/lib/data/projects";
import ProjectCard from "./projectCard";
import ProjectListItem from "./projectListItem";
import ProjectsPagination from "./projectsPagination";

type Props = {
  query: string;
  status?: ProjectStatus;
  sort?: string;
  view: "grid" | "list";
  page: number;
};

export default async function ProjectsList({
  query,
  status,
  sort,
  view,
  page,
}: Props) {
  const [result, taskStats] = await Promise.all([
    getProjectsBySearch({ query, status, sort, page }),
    getProjectTaskStats(),
  ]);

  const { projects, totalCount, totalPages, currentPage, pageSize } = result;

  if (projects.length === 0) {
    return (
      <div className="card border border-dashed border-base-300 bg-base-100">
        <div className="card-body items-center gap-2 py-16 text-center">
          <FolderIcon className="size-10 text-base-content/30" />
          <p className="font-semibold text-base-content">No projects found</p>
          <p className="text-sm text-base-content/60">
            Try a different search term or create a new project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {view === "list" ? (
        <div className="divide-y divide-base-200 overflow-hidden rounded-xl border border-base-200 bg-base-100 shadow-sm">
          {projects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              taskStats={taskStats.get(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              taskStats={taskStats.get(project.id)}
            />
          ))}
        </div>
      )}

      <ProjectsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
      />
    </div>
  );
}
