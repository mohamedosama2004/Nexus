"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  updateProject,
  type ProjectActionState,
} from "@/src/actions/project.actions";
import { SubmitButton } from "@/src/components/buttons/SubmitButton";
import ProjectDescriptionTextarea from "./projectDescriptionTextarea";
import ProjectNameInput from "./projectNameInput";
import ProjectStatusSelect from "./projectStatusSelect";

export type EditProjectModalHandle = {
  open: (event: React.MouseEvent) => void;
};

type Props = {
  projectId: string;
  projectName: string;
  description: string | null;
  status: string;
  hideTrigger?: boolean;
  ref?: React.Ref<EditProjectModalHandle>;
};

export default function EditProjectModal({
  projectId,
  projectName,
  description,
  status,
  hideTrigger = false,
  ref,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const [formKey, setFormKey] = useState(0);
  const [modalClosing, setModalClosing] = useState(false);
  const [state, formAction] = useActionState(updateProject, {
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
      toast.success("Project updated successfully!");
      closeModal();
    }
  }, [state, closeModal]);

  function openModal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFormKey((key) => key + 1);
    dialogRef.current?.showModal();
  }

  useImperativeHandle(ref, () => ({ open: openModal }));

  return (
    <>
      {!hideTrigger && (
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={openModal}
          aria-label="Edit project"
          type="button"
        >
          <PencilSquareIcon className="size-4" />
        </button>
      )}

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
            <input type="hidden" name="id" value={projectId} />

            <div>
              <h3 className="text-lg font-bold">Edit Project</h3>
              <p className="text-sm text-base-content/60">
                Update the details of this project.
              </p>
            </div>

            <ProjectNameInput error={state.error} defaultValue={projectName} />
            <ProjectDescriptionTextarea defaultValue={description ?? ""} />
            <ProjectStatusSelect defaultValue={status} />

            <div className="modal-action">
              <button type="button" className="btn" onClick={closeModal}>
                Cancel
              </button>
              <SubmitButton label="Save" pendingLabel="Saving..." />
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
