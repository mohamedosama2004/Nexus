import { getProjectsBySearch } from "@/src/lib/data/projectsSearch";
type Props = {
  query: string;
};

export default async function ProjectsList({ query }: Props) {
  const projects = await getProjectsBySearch(query);

  return (
    <div className="rounded-box border p-4">
      <div className="flex flex-col gap-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border border-base-300 p-3"
          >
            <h2 className="font-semibold">{project.name}</h2>

            <p className="text-sm text-base-content/70">
              {project.description}
            </p>

            <span className="badge badge-outline mt-2">{project.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
