"use client";
import { createProject } from "@/src/actions/project.actions";
import ProjectDescriptionTextarea from "./projectDescriptionTextarea";
import ProjectNameInput from "./projectNameInput";
import ProjectStatusSelect from "./projectStatusSelect";
import { useActionState } from "react";
import { SubmitButton } from "@/src/components/SubmitButton";
import type { ProjectActionState } from "@/src/actions/project.actions";

export default function ProjectForm() {
  const [state, formAction] = useActionState(createProject, {
    success: false,
    error: null,
  } satisfies ProjectActionState);
  return (
    <form
      action={formAction}
      className="card border border-base-200 bg-base-100 shadow-sm"
    >
      <div className="card-body">
        <div className="card-title">Create New Project</div>

        <div className="space-y-4">
          <ProjectNameInput error={state.error} />
          <ProjectDescriptionTextarea />
          <ProjectStatusSelect />
        </div>

        <div className="card-actions justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
