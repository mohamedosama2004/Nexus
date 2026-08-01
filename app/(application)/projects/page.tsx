import { Suspense } from "react";
import ProjectsList from "../_components/projectsList";
import SearchFilters from "../_components/searchFilters";
import ProjectsLoadingSkeleton from "./loading";


export default  function ProjectsPage() {
  
  return (
    <div className="space-y-6">
      <h1>Projects</h1>
      <SearchFilters/>
      <Suspense fallback={<ProjectsLoadingSkeleton/>}>
      <ProjectsList/>
      </Suspense>
    </div>
  );
}
 
