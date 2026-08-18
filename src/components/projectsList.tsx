import { FolderIcon } from "@heroicons/react/24/outline";
import { getProjectsBySearch } from "@/src/lib/data/projectsSearch";
import ProjectCard from "@/src/app/(application)/projects/_components/projectCard";

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
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
