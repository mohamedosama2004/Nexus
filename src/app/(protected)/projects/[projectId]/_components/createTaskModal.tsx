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
import { createTask, type TaskActionState } from "@/src/actions/task.actions";
import { SubmitButton } from "@/src/components/buttons/SubmitButton";
import TaskDescriptionTextarea from "./taskDescriptionTextarea";
import TaskStatusSelect from "./taskStatusSelect";
import TaskTitleInput from "./taskTitleInput";

type Props = {
  projectId: string;
};

export default function CreateTaskModal({ projectId }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const [formKey, setFormKey] = useState(0);
  const [modalClosing, setModalClosing] = useState(false);
  const [state, formAction] = useActionState(createTask, {
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
      toast.success("Task created successfully!");
      closeModal();
    }
  }, [state, closeModal]);

  function openModal() {
    setFormKey((key) => key + 1);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button className="btn btn-sm btn-primary" onClick={openModal}>
        <PlusIcon className="size-4" />
        Create task
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
            <input type="hidden" name="projectId" value={projectId} />

            <div>
              <h3 className="text-lg font-bold">Create Task</h3>
              <p className="text-sm text-base-content/60">
                Add a new task to this project.
              </p>
            </div>

            <TaskTitleInput error={state.error} />
            <TaskDescriptionTextarea />
            <TaskStatusSelect />

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
