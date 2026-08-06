import { Task } from "../definitions";

const tasks: Task[] = [
  { userId: 1, id: 1, title: "Review dashboard copy", completed: true },
  { userId: 2, id: 2, title: "Fix login validation", completed: true },
  { userId: 3, id: 3, title: "Refine project cards", completed: false },
  { userId: 4, id: 4, title: "Tune search filters", completed: false },
  { userId: 5, id: 5, title: "Prepare release notes", completed: true },
  { userId: 1, id: 6, title: "Audit profile settings", completed: false },
];

export async function getTasks() {
  return tasks;
}
