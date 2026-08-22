"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateTask, type TaskActionState } from "@/src/actions/task.actions";
import { SubmitButton } from "@/src/components/buttons/SubmitButton";
import TaskDescriptionTextarea from "./taskDescriptionTextarea";
import TaskStatusSelect from "./taskStatusSelect";
import TaskTitleInput from "./taskTitleInput";

type Props = {
  projectId: string;
  taskId: string;
  title: string;
  description: string | null;
  status: string;
};

export default function EditTaskModal({
  projectId,
  taskId,
  title,
  description,
  status,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const [formKey, setFormKey] = useState(0);
  const [modalClosing, setModalClosing] = useState(false);
  const [state, formAction] = useActionState(updateTask, {
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
      toast.success("Task updated successfully!");
      closeModal();
    }
  }, [state, closeModal]);

  function openModal() {
    setFormKey((key) => key + 1);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        className="btn btn-ghost btn-sm btn-square"
        onClick={openModal}
        aria-label="Edit task"
      >
        <PencilSquareIcon className="size-4" />
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
            <input type="hidden" name="id" value={taskId} />
            <input type="hidden" name="projectId" value={projectId} />

            <div>
              <h3 className="text-lg font-bold">Edit Task</h3>
              <p className="text-sm text-base-content/60">
                Update the details of this task.
              </p>
            </div>

            <TaskTitleInput error={state.error} defaultValue={title} />
            <TaskDescriptionTextarea defaultValue={description ?? ""} />
            <TaskStatusSelect defaultValue={status} />

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
