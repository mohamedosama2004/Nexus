import type { ProjectTask } from "../types";

export type BoardColumn = {
  key: string;
  label: string;
  dot: string;
  done: boolean;
};

export const BOARD_COLUMNS: BoardColumn[] = [
  { key: "TODO", label: "To Do", dot: "bg-base-300", done: false },
  { key: "active", label: "Active", dot: "bg-info", done: false },
  {
    key: "completed",
    label: "Completed",
    dot: "bg-success",
    done: true,
  },
];

export function isBoardColumn(key: string): key is BoardColumn["key"] {
  return BOARD_COLUMNS.some((column) => column.key === key);
}

export type { ProjectTask };
