import Link from "next/link";
import { ArrowRightIcon, FolderIcon } from "@heroicons/react/24/outline";
import { getProjectsBySearch } from "@/src/lib/data/projectsSearch";
import ProjectStatusBadge from "./projectStatusBadge";

type Props = {
  query: string;
};

export default async function ProjectsList({ query }: Props) {
  const projects = await getProjectsBySearch(query);

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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="group card border border-base-200 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
        >
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
              <span className="flex items-center gap-1 text-sm font-medium text-base-content/60 transition-colors group-hover:text-primary">
                Open
                <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
