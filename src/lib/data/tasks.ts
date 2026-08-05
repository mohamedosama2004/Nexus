import { Task } from "../definitions";

export async function getTasks() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  const tasks: Task[] = await response.json();
  return tasks;
}
