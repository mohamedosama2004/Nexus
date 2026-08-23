"use client";

import { useRef } from "react";
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import DeleteProjectButton, {
  type DeleteProjectButtonHandle,
} from "./deleteProjectButton";
import EditProjectModal, {
  type EditProjectModalHandle,
} from "./editProjectModal";

type Props = {
  projectId: string;
  projectName: string;
  description: string | null;
  status: string;
  className?: string;
};

export default function ProjectActionsMenu({
  projectId,
  projectName,
  description,
  status,
  className = "",
}: Props) {
  const editModalRef = useRef<EditProjectModalHandle>(null);
  const deleteModalRef = useRef<DeleteProjectButtonHandle>(null);

  function openMenuAction(
    handle: { open: (event: React.MouseEvent) => void } | null,
    event: React.MouseEvent,
  ) {
    event.preventDefault();
    event.stopPropagation();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    handle?.open(event);
  }

  return (
    <>
      <div
        className={`dropdown dropdown-end ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          tabIndex={0}
          type="button"
          aria-label="Project actions"
          aria-haspopup="menu"
          className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:bg-base-200 hover:text-base-content"
        >
          <EllipsisVerticalIcon className="size-4" />
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-30 mt-1 w-36 rounded-xl border border-base-200 bg-base-100 p-1 shadow-lg"
        >
          <li>
            <button
              type="button"
              onClick={(event) => openMenuAction(editModalRef.current, event)}
              className="text-base-content/70 hover:bg-base-200 hover:text-base-content"
            >
              <PencilSquareIcon className="size-4" />
              Edit
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={(event) => openMenuAction(deleteModalRef.current, event)}
              className="text-error/80 hover:bg-error/10 hover:text-error"
            >
              <TrashIcon className="size-4" />
              Delete
            </button>
          </li>
        </ul>
      </div>

      <EditProjectModal
        ref={editModalRef}
        hideTrigger
        projectId={projectId}
        projectName={projectName}
        description={description}
        status={status}
      />
      <DeleteProjectButton
        ref={deleteModalRef}
        hideTrigger
        projectId={projectId}
        projectName={projectName}
      />
    </>
  );
}
