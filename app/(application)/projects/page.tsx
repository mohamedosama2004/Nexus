import { Suspense } from "react";
import ProjectsList from "../_components/projectsList";
import SearchFilters from "../_components/searchFilters";
import ProjectsLoadingSkeleton from "./loading";


type Props = {
  searchParams: Promise<{
    query?: string;
  }>;
};
export default async function ProjectsPage({
  searchParams,
}: Props) {
  const {query=""}= await searchParams
  return (
    <div className="space-y-6">
      <h1>Projects</h1>
      <SearchFilters />
      <Suspense fallback={<ProjectsLoadingSkeleton />}>
        <ProjectsList query={query} />
      </Suspense>
    </div>
  );
}
