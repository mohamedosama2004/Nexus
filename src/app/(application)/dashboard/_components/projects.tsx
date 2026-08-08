import { getProjects } from "@/src/lib/data/projects";

export default async function Projects() {
  const projects = await getProjects();

  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="card-title">
          Recent Projects
          <span className="badge badge-ghost">{projects.length} total</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {projects.slice(0, 6).map((project) => (
            <article
              key={project.id}
              className="rounded-box border border-base-200 p-4 transition-colors hover:border-primary/40 hover:bg-base-200/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-base-content line-clamp-1">
                  {project.title} 
                </h3>
               
              </div>
              <p className="mt-1 text-sm text-base-content/60 line-clamp-2">
                {project.description} 
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
