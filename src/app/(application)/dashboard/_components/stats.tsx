import { getAttachments } from "@/src/lib/data/attachments";
import { getUsers } from "@/src/lib/data/members";
import { getProjects } from "@/src/lib/data/projects";
import { getTasks } from "@/src/lib/data/tasks";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  FolderIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const stats = [
  { label: "Users", icon: UsersIcon },
  { label: "Projects", icon: FolderIcon },
  { label: "Tasks", icon: CheckCircleIcon },
  { label: "Attachments", icon: DocumentTextIcon },
] as const;


export default async function Stats() {
  const [users, projects, tasks, attachments] = await Promise.all([
    getUsers(),
    getProjects(),
    getTasks(),
    getAttachments(),
  ]);
  const values = [users.length, projects.length, tasks.length, attachments.length];

  return (
    <div className="stats stats-vertical w-full shadow-sm lg:stats-horizontal">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="stat">
            <div className="stat-figure text-primary">
              <Icon className="size-8" />
            </div>
            <div className="stat-title">{stat.label}</div>
            <div className="stat-value text-primary">{values[index]}</div>
            <div className="stat-desc">Total in workspace</div>
          </div>
        );
      })}
    </div>
  );
}
