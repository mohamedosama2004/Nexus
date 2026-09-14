"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

import {
  leaveWorkspace,
  type SettingsActionState,
} from "@/src/actions/settings.actions";

type LeaveWorkspaceProps = {
  canLeave: boolean;
};

export function LeaveWorkspace({ canLeave }: LeaveWorkspaceProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [state, formAction] = useActionState(leaveWorkspace, {
    success: false,
    error: null,
  } satisfies SettingsActionState);

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
    if (!state.success) return;

    toast.success("You left the workspace.");
    router.push("/dashboard");
    router.refresh();
  }, [state, router]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            disabled={!canLeave}
            className="btn btn-outline btn-error btn-sm h-10 shrink-0 self-start rounded-lg px-4 sm:self-auto"
          >
            <ArrowLeftEndOnRectangleIcon className="h-4 w-4" />
            Leave Workspace
          </button>
        </div>

        {!canLeave && (
          <p className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            Workspace owners cannot leave the workspace. Transfer ownership
            before leaving.
          </p>
        )}
      </div>

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
              <h3 className="text-lg font-bold text-base-content">
                Leave this workspace?
              </h3>
              <p className="mt-1 text-sm text-base-content/60">
                Are you sure you want to leave this workspace? You will lose
                access to it and its projects. This cannot be undone.
              </p>
            </div>

            {state.error && (
              <div
                role="alert"
                className="alert alert-error py-2.5 text-sm"
              >
                <span>{state.error}</span>
              </div>
            )}

            <div className="modal-action">
              <button type="button" className="btn" onClick={closeModal}>
                Cancel
              </button>
              <form action={formAction}>
                <button
                  type="submit"
                  className="btn btn-error"
                  disabled={state.success}
                >
                  Leave Workspace
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
    </>
  );
}