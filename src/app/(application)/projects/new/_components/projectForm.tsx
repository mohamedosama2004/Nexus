import ProjectDescriptionTextarea from "./projectDescriptionTextarea";
import ProjectNameInput from "./projectNameInput";
import ProjectStatusSelect from "./projectStatusSelect";

export default function ProjectForm() {
  return (
    <form className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="card-title">Create New Project</div>

        <div className="space-y-4">
          <ProjectNameInput />
          <ProjectDescriptionTextarea />
          <ProjectStatusSelect />
        </div>

        <div className="card-actions justify-end">
          <button type="submit" className="btn btn-primary">
            Create Project
          </button>
        </div>
      </div>
    </form>
  );
}
