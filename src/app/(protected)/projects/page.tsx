import { Suspense } from "react";
import ProjectsList from "./_components/projectsList";
import SearchFilters from "./_components/searchFilters";
import ProjectsLoadingSkeleton from "./loading";
import CreateProjectModal from "./_components/createProjectModal";

type Props = {
  searchParams: Promise<{
    query?: string;
  }>;
};
export default async function ProjectsPage({ searchParams }: Props) {
  const { query = "" } = await searchParams;
  return (
    <div className="space-y-6">
      <header className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-base-content">Projects</h1>
          <p className="text-sm text-base-content/60">
            Browse and manage all your workspace projects.
          </p>
        </div>
        <div className="justify-self-end">
          <CreateProjectModal />
        </div>
      </header>
      <SearchFilters />
      <Suspense fallback={<ProjectsLoadingSkeleton />}>
        <ProjectsList query={query} />
      </Suspense>
    </div>
  );
}
