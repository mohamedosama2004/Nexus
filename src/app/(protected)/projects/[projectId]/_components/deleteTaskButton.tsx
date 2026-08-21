"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deleteTask, type TaskActionState } from "@/src/actions/task.actions";

type Props = {
  projectId: string;
  taskId: string;
  taskTitle: string;
};

export default function DeleteTaskButton({
  projectId,
  taskId,
  taskTitle,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [state, formAction] = useActionState(deleteTask, {
    success: false,
    error: null,
  } satisfies TaskActionState);

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
      toast.success("Task deleted successfully!");
      closeModal();
    }
  }, [state, closeModal]);

  function openModal() {
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        className="btn btn-ghost btn-sm btn-square text-error"
        onClick={openModal}
        aria-label="Delete task"
      >
        <TrashIcon className="size-4" />
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

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Delete Task</h3>
              <p className="text-sm text-base-content/60">
                Are you sure you want to delete{" "}
                <span className="font-medium">{taskTitle}</span>? This action
                cannot be undone.
              </p>
            </div>

            {state.error && (
              <p className="text-error text-sm">{state.error}</p>
            )}

            <div className="modal-action">
              <button type="button" className="btn" onClick={closeModal}>
                Cancel
              </button>
              <form action={formAction}>
                <input type="hidden" name="id" value={taskId} />
                <input type="hidden" name="projectId" value={projectId} />
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
