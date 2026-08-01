export type ProjectStatus = "active" | "completed";

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
}

const projects: Project[] = [
  {
    id: 1,
    name: "Nexus Dashboard",
    description: "Admin dashboard",
    status: "active",
  },
  {
    id: 2,
    name: "Authentication",
    description: "Login & Register",
    status: "completed",
  },
  {
    id: 3,
    name: "Project Explorer",
    description: "Search and filtering",
    status: "active",
  },
];

export async function getProjects(query: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const normalizedQuery = query.trim().toLowerCase();

  return projects.filter((project) =>
    project.name.toLowerCase().includes(normalizedQuery),
  );
}
