import { getProjects } from "@/src/lib/data/projects";

export default async function Projects() {
  const projects = await getProjects();

  return (
    <section className="rounded-xl border border-base-200 bg-base-100">
      <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
        <h2 className="text-base font-semibold text-base-content">Recent Projects</h2>
        <span className="rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-medium text-base-content/60">
          {projects.length} total
        </span>
      </div>

      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.slice(0, 6).map((project) => (
            <article
              key={project.id}
              className="rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-base-content line-clamp-1">
                  {project.title}
                </h3>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {project.status}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-base-content/50 line-clamp-2">
                {project.description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-base-content/40">
                <span>{project._count.tasks} tasks</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
