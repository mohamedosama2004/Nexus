import { Project } from "../definitions";



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

export async function getProjectsBySearch(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return projects.filter((project) =>
    project.name.toLowerCase().includes(normalizedQuery),
  );
}
