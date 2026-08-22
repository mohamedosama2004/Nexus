"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createProject,
  type ProjectActionState,
} from "@/src/actions/project.actions";
import { SubmitButton } from "@/src/components/buttons/SubmitButton";
import ProjectDescriptionTextarea from "./projectDescriptionTextarea";
import ProjectNameInput from "./projectNameInput";
import ProjectStatusSelect from "./projectStatusSelect";

export default function CreateProjectModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const [formKey, setFormKey] = useState(0);
  const [modalClosing, setModalClosing] = useState(false);
  const [state, formAction] = useActionState(createProject, {
    success: false,
    error: null,
  } satisfies ProjectActionState);

  const closeModal = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || isClosingRef.current) return;

    isClosingRef.current = true;
    setModalClosing(true);

    const finishClose = () => {
      dialog.classList.remove("modal-closing");
      if (dialog.open) dialog.close();
      isClosingRef.current = false;
      setModalClosing(false);
    };

    dialog.addEventListener(
      "animationend",
      (event) => {
        if (event.target !== dialog) return;
        finishClose();
      },
      { once: true },
    );

    window.setTimeout(() => {
      if (dialog.open) finishClose();
    }, 300);
  }, []);

  useEffect(() => {
    if (state.success) {
      toast.success("Project created successfully!");
      closeModal();
    }
  }, [state, closeModal]);

  function openModal() {
    setFormKey((key) => key + 1);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button className="btn btn-primary" onClick={openModal}>
        <PlusIcon className="size-4" />
        Create new project
      </button>

      <dialog
        ref={dialogRef}
        className={`modal ${modalClosing ? "modal-closing" : ""}`}
        onCancel={(event) => {
          event.preventDefault();
          closeModal();
        }}
      >
        <div className="modal-box">
          <button
            type="button"
            aria-label="Close"
            onClick={closeModal}
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          >
            ✕
          </button>

          <form key={formKey} action={formAction} className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Create Project</h3>
              <p className="text-sm text-base-content/60">
                Create a new project for your workspace.
              </p>
            </div>

            <ProjectNameInput error={state.error} />
            <ProjectDescriptionTextarea />
            <ProjectStatusSelect />

            <div className="modal-action">
              <button type="button" className="btn" onClick={closeModal}>
                Cancel
              </button>
              <SubmitButton />
            </div>
          </form>
        </div>

        <form
          className="modal-backdrop"
          onSubmit={(event) => {
            event.preventDefault();
            closeModal();
          }}
        >
          <button aria-label="Close">close</button>
        </form>
      </dialog>

      <ToastContainer position="top-right" />
    </>
  );
}
