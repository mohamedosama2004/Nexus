import { Suspense } from "react";
import ProjectsView from "../_components/ProjectsFilter";
import FavoriteButton from "../_components/FavoriteButton";
// import ProjectsViewToggle from "../_components/ProjectsViewToggle";

export default function ProjectsPage() {
  return (
    <div>
      <h2>Projects</h2>
      <p>project views are : </p>
      <Suspense fallback={<p>Loading filters...</p>}>
        <ProjectsView />
      </Suspense>
      {/* <ProjectsViewToggle/> */}
      <FavoriteButton/>
    </div>
  );
}
