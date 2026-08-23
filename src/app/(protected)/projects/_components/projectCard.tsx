"use client";

import { useRouter } from "next/navigation";
import type { ProjectWithMembers } from "@/src/lib/data/projects";
import type { ProjectTaskStats } from "@/src/lib/data/projectsSearch";
import ProjectStatusBadge from "@/src/app/(protected)/projects/_components/projectStatusBadge";
import ProjectMembersStack from "@/src/app/(protected)/projects/[projectId]/_components/projectMembersStack";
import { ProjectDateRange, TaskProgress } from "./projectMeta";
import ProjectActionsMenu from "./projectActionsMenu";

type Props = {
  project: ProjectWithMembers;
  taskStats?: ProjectTaskStats;
};

export default function ProjectCard({ project, taskStats }: Props) {
  const router = useRouter();

  function openProject() {
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="relative h-full">
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
        className="group card h-full cursor-pointer rounded-xl border border-base-200 bg-base-100 shadow-sm outline-none transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:border-primary/60"
      >
        <div className="card-body gap-3 p-5">
          <div className="flex items-center justify-between gap-2 pr-9">
            <ProjectStatusBadge status={project.status} compact outline />
            <span className="text-xs font-medium text-base-content/40">
              {project._count.tasks}{" "}
              {project._count.tasks === 1 ? "task" : "tasks"}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="line-clamp-1 text-base font-semibold leading-snug tracking-tight text-base-content transition-colors group-hover:text-primary">
              {project.title}
            </h2>

            <p className="line-clamp-2 min-h-10 text-sm text-base-content/60">
              {project.description || "No description provided."}
            </p>
          </div>

          <TaskProgress stats={taskStats} />

          <div className="divider my-0 h-px border-base-200" />

          <div className="flex items-center justify-between gap-2">
            <ProjectDateRange project={project} />
            <ProjectMembersStack members={project.members} />
          </div>
        </div>
      </div>

      <ProjectActionsMenu
        projectId={project.id}
        projectName={project.title}
        description={project.description}
        status={project.status}
        className="absolute right-3 top-[13px] z-20"
      />
    </div>
  );
}
