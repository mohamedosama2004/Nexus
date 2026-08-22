"use client";

import { useDroppable } from "@dnd-kit/core";
import { BoardCard } from "./BoardCard";
import type { BoardColumn } from "./columns";
import type { ProjectTask } from "../types";

type StatusColumnProps = {
  column: BoardColumn;
  projectId: string;
  tasks: ProjectTask[];
};

export function StatusColumn({ column, projectId, tasks }: StatusColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${column.dot}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
          {column.label}
        </span>
        <span className="rounded-full bg-base-200 px-1.5 py-0.5 text-[10px] font-medium text-base-content/40">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-col gap-2 rounded-lg p-1 transition-colors ${
          isOver ? "bg-primary/5 ring-1 ring-primary/30" : ""
        }`}
      >
        {tasks.length === 0 && !isOver ? (
          <div className="rounded-lg border border-dashed border-base-200 p-4 text-center text-xs text-base-content/30">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <BoardCard
              key={task.id}
              task={task}
              projectId={projectId}
              done={column.done}
            />
          ))
        )}
      </div>
    </div>
  );
}
