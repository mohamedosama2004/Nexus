import { Suspense } from "react";

import ProjectsList from "./_components/projectsList";
import SearchFilters from "./_components/searchFilters";
import ProjectsLoadingSkeleton from "./loading";
import CreateProjectModal from "./_components/createProjectModal";
import { resolveProjectSort } from "@/src/lib/data/projects";

type Props = {
  searchParams: Promise<{
    query?: string;
    status?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: Props) {
  const { query = "", status, sort, view, page } = await searchParams;

  const validStatus =
    status === "active" || status === "completed" ? status : undefined;

  const validSort = resolveProjectSort(sort);
  const validView = view === "list" ? "list" : "grid";

  const parsedPage = Number.parseInt(page ?? "", 10);
  const validPage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-base-content">
            Projects
          </h1>

          <p className="text-sm text-base-content/60">
            Browse and manage all your workspace projects.
          </p>
        </div>

        <div className="justify-self-end">
          <CreateProjectModal />
        </div>
      </header>

      <SearchFilters currentStatus={validStatus} currentSort={validSort} />

      <Suspense fallback={<ProjectsLoadingSkeleton />}>
        <ProjectsList
          query={query}
          status={validStatus}
          sort={validSort}
          view={validView}
          page={validPage}
        />
      </Suspense>
    </div>
  );
}
