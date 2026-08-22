"use client";

import { useDraggable } from "@dnd-kit/core";
import EditTaskModal from "../editTaskModal";
import DeleteTaskButton from "../deleteTaskButton";
import { TaskCardBody } from "./TaskCardBody";
import type { ProjectTask } from "../types";

type BoardCardProps = {
  task: ProjectTask;
  projectId: string;
  done: boolean;
};

export function BoardCard({ task, projectId, done }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={`group touch-none rounded-lg border border-base-200 bg-base-200/30 p-2.5 transition-colors hover:border-primary/30 ${
        isDragging ? "opacity-40" : ""
      } ${done ? "" : "cursor-grab active:cursor-grabbing"}`}
    >
      <TaskCardBody task={task} done={done} />

      {!done && (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="rounded bg-base-300 px-1.5 py-0.5 text-[9px] font-medium text-base-content/40">
            #{task.id.slice(-6)}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <EditTaskModal
              projectId={projectId}
              taskId={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
            />
            <DeleteTaskButton
              projectId={projectId}
              taskId={task.id}
              taskTitle={task.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}
