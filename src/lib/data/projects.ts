import { prisma } from "../prisma";

export async function getProjects() {
  const projects =await prisma.project.findMany(); 
  
  return projects;
}
