"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "react-toastify";
import { setTaskStatus } from "@/src/actions/task.actions";
import { BoardHeader } from "./BoardHeader";
import { BoardProgress } from "./BoardProgress";
import { StatusColumn } from "./StatusColumn";
import { TaskCardBody } from "./TaskCardBody";
import { BOARD_COLUMNS, isBoardColumn } from "./columns";
import type {
  ProjectTask,
  ProjectWithMembersAndTasks,
} from "../types";

type ProjectBoardProps = {
  project: ProjectWithMembersAndTasks;
  projectId: string;
  tasks: ProjectTask[];
};

export default function ProjectBoard({
  project,
  projectId,
  tasks,
}: ProjectBoardProps) {
  const [items, setItems] = useState<ProjectTask[]>(tasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // small threshold so clicks on edit/delete still register as clicks
      activationConstraint: { distance: 6 },
    })
  );

  const completedCount = items.filter(
    (task) => task.status === "completed"
  ).length;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTaskId(null);

    const taskId = String(event.active.id);
    const statusKey = event.over ? String(event.over.id) : null;

    if (!statusKey || !isBoardColumn(statusKey)) {
      return;
    }

    const task = items.find((t) => t.id === taskId);
    if (!task || task.status === statusKey) {
      return;
    }

    // optimistic move
    const previous = items;
    setItems((current) =>
      current.map((t) => (t.id === taskId ? { ...t, status: statusKey } : t))
    );

    const result = await setTaskStatus(taskId, statusKey);

    if (!result.success) {
      setItems(previous);
      toast.error(result.error ?? "Failed to update task status.");
    }
  };

  const activeTask = items.find((t) => t.id === activeTaskId) ?? null;

  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body">
        <BoardHeader project={project} projectId={projectId} />

        <BoardProgress total={items.length} completed={completedCount} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveTaskId(null)}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {BOARD_COLUMNS.map((column) => (
              <StatusColumn
                key={column.key}
                column={column}
                projectId={projectId}
                tasks={items.filter((task) => task.status === column.key)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCardBody task={activeTask} done={false} dragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </section>
  );
}
