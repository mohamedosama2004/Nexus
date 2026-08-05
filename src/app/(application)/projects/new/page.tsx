import ProjectForm from "./_components/projectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-base-content">New Project</h1>
        <p className="text-sm text-base-content/60">
          Create a new project for your workspace
        </p>
      </header>

      <ProjectForm />
    </div>
  );
}
