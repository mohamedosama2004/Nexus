import { prisma } from "../prisma";

export async function getTasks() {
  const tasks=await prisma.task.findMany(); 
  return tasks;
}


