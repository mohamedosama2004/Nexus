import { Post } from "../definitions";

const projects: Post[] = [
  {
    userId: 1,
    id: 1,
    title: "Dashboard redesign",
    body: "Refresh the admin interface with a cleaner layout and clearer hierarchy.",
  },
  {
    userId: 2,
    id: 2,
    title: "Authentication flow",
    body: "Stabilize login and registration screens with better validation and feedback.",
  },
  {
    userId: 3,
    id: 3,
    title: "Project search",
    body: "Improve search speed and filtering so users can find work items faster.",
  },
  {
    userId: 4,
    id: 4,
    title: "Notifications panel",
    body: "Add a lightweight activity feed for updates, mentions, and task changes.",
  },
  {
    userId: 5,
    id: 5,
    title: "Profile settings",
    body: "Expand user preferences and make account controls easier to scan.",
  },
];

export async function getProjects() {
  return projects;
}
