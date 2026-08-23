"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ExclamationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  deleteProject,
  type ProjectActionState,
} from "@/src/actions/project.actions";

export type DeleteProjectButtonHandle = {
  open: (event: React.MouseEvent) => void;
};

type Props = {
  projectId: string;
  projectName: string;
  hideTrigger?: boolean;
  ref?: React.Ref<DeleteProjectButtonHandle>;
};

export default function DeleteProjectButton({
  projectId,
  projectName,
  hideTrigger = false,
  ref,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [state, formAction] = useActionState<ProjectActionState, FormData>(
    deleteProject,
    { success: false, error: null },
  );

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
      toast.success("Project deleted successfully!");
      closeModal();
    }
  }, [state, closeModal]);

  function openModal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dialogRef.current?.showModal();
  }

  useImperativeHandle(ref, () => ({ open: openModal }));

  return (
    <>
      {!hideTrigger && (
        <button
          className="btn btn-ghost btn-sm btn-square text-error"
          onClick={openModal}
          aria-label="Delete project"
          type="button"
        >
          <TrashIcon className="size-4" />
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

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Delete Project</h3>
              <p className="text-sm text-base-content/60">
                Are you sure you want to delete{" "}
                <span className="font-medium">{projectName}</span>? This will
                also delete all associated tasks. This action cannot be undone.
              </p>
            </div>

            {state.error && (
              <div className="alert alert-error">
                <ExclamationCircleIcon className="size-5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="modal-action">
              <button type="button" className="btn" onClick={closeModal}>
                Cancel
              </button>
              <form action={formAction}>
                <input type="hidden" name="id" value={projectId} />
                <button
                  type="submit"
                  className="btn btn-error"
                  disabled={state.success}
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
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
