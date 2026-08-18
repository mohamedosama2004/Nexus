"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import ProjectStatusBadge from "@/src/components/projectStatusBadge";
import DeleteProjectButton from "./deleteProjectButton";
import EditProjectModal from "./editProjectModal";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  _count: { tasks: number };
};

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="group card border border-base-200 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="text-xs text-base-content/50">
            {project._count.tasks} tasks
          </span>
        </div>

        <h2 className="card-title text-lg leading-snug line-clamp-1 transition-colors group-hover:text-primary">
          {project.title}
        </h2>

        <p className="flex-1 text-sm text-base-content/60 line-clamp-2">
          {project.description || "No description provided."}
        </p>

        <div className="divider divider-neutral my-1" />

        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-base-content/40">
            #{project.id.slice(0, 8)}
          </span>
          <div className="flex items-center gap-1">
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-1 text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
            >
              Open
              <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <EditProjectModal
              projectId={project.id}
              projectName={project.title}
              description={project.description}
              status={project.status}
            />
            <DeleteProjectButton
              projectId={project.id}
              projectName={project.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
