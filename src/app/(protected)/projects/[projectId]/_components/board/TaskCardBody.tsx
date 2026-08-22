import type { ProjectTask } from "../types";

type TaskCardBodyProps = {
  task: ProjectTask;
  done: boolean;
  dragging?: boolean;
};

export function TaskCardBody({ task, done, dragging = false }: TaskCardBodyProps) {
  return (
    <div
      className={`text-xs font-medium text-base-content ${
        done ? "line-through opacity-50" : ""
      } ${dragging ? "rotate-2 shadow-lg" : ""}`}
    >
      {task.title}
      {task.description && (
        <p className="mt-1 line-clamp-2 text-[11px] font-normal leading-snug text-base-content/50">
          {task.description}
        </p>
      )}
    </div>
  );
}
