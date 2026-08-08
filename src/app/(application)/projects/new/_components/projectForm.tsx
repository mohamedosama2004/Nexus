"use client";
import { createProject } from "@/src/actions/project.actions";
import ProjectDescriptionTextarea from "./projectDescriptionTextarea";
import ProjectNameInput from "./projectNameInput";
import ProjectStatusSelect from "./projectStatusSelect";
import { useActionState, useEffect } from "react";
import { SubmitButton } from "@/src/components/SubmitButton";
import type { ProjectActionState } from "@/src/actions/project.actions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function ProjectForm() {
  const [state, formAction] = useActionState(createProject, {
    success: false,
    error: null,
  } satisfies ProjectActionState);
  useEffect(() => {
    if (state.success) {
      toast.success("Project created successfully!");
    }
  }, [state]);

  return (
    <>
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
      <ToastContainer position="top-right" />
    </>
  );
}
