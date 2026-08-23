import { CalendarDaysIcon } from "@heroicons/react/24/outline";

import type { ProjectTaskStats } from "@/src/lib/data/projectsSearch";

type ProjectDateFields = {
  createdAt: Date | string;
  startDate: Date | string | null;
  dueDate: Date | string | null;
};

export function formatProjectDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectDateRange({ project }: { project: ProjectDateFields }) {
  let label: string;

  if (project.startDate && project.dueDate) {
    label = `${formatProjectDate(project.startDate)} → ${formatProjectDate(
      project.dueDate,
    )}`;
  } else if (project.dueDate) {
    label = `Due ${formatProjectDate(project.dueDate)}`;
  } else if (project.startDate) {
    label = `Starts ${formatProjectDate(project.startDate)}`;
  } else {
    label = `Created ${formatProjectDate(project.createdAt)}`;
  }

  return (
    <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-base-content/40">
      <CalendarDaysIcon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}

const FALLBACK_TASK_STATS: ProjectTaskStats = { total: 0, completed: 0 };

export function TaskProgress({
  stats,
}: {
  stats: ProjectTaskStats | undefined;
}) {
  const { total, completed } = stats ?? FALLBACK_TASK_STATS;

  if (total === 0) {
    return (
      <span className="text-xs font-medium text-base-content/40">
        No tasks yet
      </span>
    );
  }

  const percent = Math.round((completed / total) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-base-content/50">
          {completed}/{total} tasks
        </span>
        <span className="font-semibold text-base-content/70">{percent}%</span>
      </div>
      <progress
        className="progress progress-primary h-1.5"
        value={completed}
        max={total}
        aria-label={`${percent}% of tasks completed`}
      />
    </div>
  );
}
