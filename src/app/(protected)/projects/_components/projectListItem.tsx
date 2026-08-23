"use client";

import { useRouter } from "next/navigation";
import type { ProjectWithMembers } from "@/src/lib/data/projects";
import type { ProjectTaskStats } from "@/src/lib/data/projectsSearch";
import ProjectStatusBadge from "@/src/app/(protected)/projects/_components/projectStatusBadge";
import ProjectMembersStack from "@/src/app/(protected)/projects/[projectId]/_components/projectMembersStack";
import {
  ProjectDateRange,
  formatProjectDate,
} from "@/src/app/(protected)/projects/_components/projectMeta";
import ProjectActionsMenu from "./projectActionsMenu";

type Props = {
  project: ProjectWithMembers;
  taskStats?: ProjectTaskStats;
};

export default function ProjectListItem({ project, taskStats }: Props) {
  const router = useRouter();
  const stats = taskStats ?? { total: project._count.tasks, completed: 0 };

  function openProject() {
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="group relative transition-colors hover:bg-base-200/40">
      <div
        role="link"
        tabIndex={0}
        onClick={openProject}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.target === event.currentTarget) {
            openProject();
          }
        }}
        aria-label={`Open project ${project.title}`}
        className="absolute inset-0 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5 pr-14 sm:flex-nowrap">
        <div className="order-1 min-w-0 flex-1 basis-full sm:basis-0">
          <h3 className="truncate text-sm font-semibold text-base-content transition-colors group-hover:text-primary">
            {project.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-base-content/50">
            {project.description || "No description provided."}
          </p>
        </div>

        <div className="order-2 shrink-0">
          <ProjectStatusBadge status={project.status} compact />
        </div>

        <div className="order-3 hidden w-28 shrink-0 md:block">
          <ProjectMembersStack members={project.members.slice(0, 4)} />
        </div>

        <div className="order-4 hidden w-20 shrink-0 lg:block">
          <span className="text-xs font-medium text-base-content/50">
            {stats.total} {stats.total === 1 ? "task" : "tasks"}
          </span>
          {stats.total > 0 && (
            <span className="block text-xs text-base-content/40">
              {Math.round((stats.completed / stats.total) * 100)}% done
            </span>
          )}
        </div>

        <div className="order-5 hidden min-w-0 flex-1 basis-52 xl:block">
          <ProjectDateRange project={project} />
          <span className="mt-0.5 block text-[11px] text-base-content/35">
            Updated {formatProjectDate(project.updatedAt)}
          </span>
        </div>
      </div>

      <ProjectActionsMenu
        projectId={project.id}
        projectName={project.title}
        description={project.description}
        status={project.status}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
      />
    </div>
  );
}
