import { Suspense } from "react";
import ProjectsList from "../../../components/projectsList";
import SearchFilters from "../../../components/searchFilters";
import NextpageButton from "../../../components/NextpageButton";
import ProjectsLoadingSkeleton from "./loading";

type Props = {
  searchParams: Promise<{
    query?: string;
  }>;
};
export default async function ProjectsPage({ searchParams }: Props) {
  const { query = "" } = await searchParams;
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1>Projects</h1>
        <NextpageButton route="/projects/new" title="Create new project" />
      </header>
      <SearchFilters />
      <Suspense fallback={<ProjectsLoadingSkeleton />}>
        <ProjectsList query={query} />
      </Suspense>
    </div>
  );
}
